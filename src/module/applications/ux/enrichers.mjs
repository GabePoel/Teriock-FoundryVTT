//noinspection RegExpRedundantEscape

import { icons } from "../../constants/display/icons.mjs";
import {
  commands,
  getInteractionEntryValue,
  interpretArguments,
  parseArguments,
} from "../../helpers/interaction/_module.mjs";
import {
  toCamelCase,
  toKebabCase,
  toTitleCase,
  ucFirst,
} from "../../helpers/string.mjs";
import { makeIconElement } from "../../helpers/utils.mjs";

const enricherIcons = {
  Class: icons.document.rank,
  Condition: icons.document.condition,
  Core: icons.document.core,
  Damage: icons.effect.damage,
  Drain: icons.effect.drain,
  Keyword: icons.document.keyword,
  Tradecraft: icons.document.fluency,
};

/**
 * Wiki link enricher. Designed to mimic the `@EMBED` and `@UUID` enrichers as well as the `{{L}}` wiki syntax.
 * @type {Teriock.Foundry.TextEditorEnricherConfig}
 */
const wikiLinkEnricher = {
  pattern: /@L\[(.+?)\](?:\{(.+?)\})?/g,
  enricher: async (match) => {
    const pageName = match[1];
    let displayText = match[2];
    const namespace = pageName.split(":")[0];
    let target = pageName.split(":")[1];
    if (!displayText) {
      displayText = target;
    }
    if (
      Object.keys(TERIOCK.aliases[namespace.toLowerCase()] || {}).includes(
        target,
      )
    ) {
      target = TERIOCK.aliases[namespace.toLowerCase()][target];
    }
    const urlPageName = pageName.replace(/ /g, "_");
    const link = document.createElement("a");
    const address = `https://wiki.teriock.com/index.php/${urlPageName}`;
    let uuid;
    let icon = "globe";
    if (namespace === "Equipment") {
      uuid = game.teriock.packs.equipment.index.getName(target)?.uuid;
      icon = uuid ? TERIOCK.options.document.equipment.icon : icon;
    } else if (namespace === "Creature") {
      uuid = game.teriock.packs.creatures.index.getName(target)?.uuid;
      icon = uuid ? TERIOCK.options.document.creature.icon : icon;
    } else if (namespace === "Ability") {
      uuid = game.teriock.packs.abilities.index.getName(target)?.uuid;
      icon = uuid ? TERIOCK.options.document.ability.icon : icon;
    } else if (namespace === "Property") {
      uuid = game.teriock.packs.properties.index.getName(target)?.uuid;
      icon = uuid ? TERIOCK.options.document.property.icon : icon;
    } else if (namespace === "Body") {
      uuid = game.teriock.packs.bodyParts.index.getName(target)?.uuid;
      icon = uuid ? TERIOCK.options.document.body.icon : icon;
    } else if (
      [
        "Keyword",
        "Core",
        "Condition",
        "Damage",
        "Drain",
        "Tradecraft",
        "Class",
      ].includes(namespace)
    ) {
      const compendiumIndex = game.teriock.packs.rules.index.getName(namespace);
      const compendium = await fromUuid(compendiumIndex.uuid);
      uuid = compendium.pages.getName(target)?.uuid;
      icon = uuid ? enricherIcons[namespace] : icon;
    }
    if (uuid) {
      const parsed = foundry.utils.parseUuid(uuid);
      link.dataset.uuid = uuid;
      link.dataset.id = parsed.id;
      link.dataset.makeTooltip = "true";
      link.dataset.wikiAddress = address;
      link.dataset.wikiContext = "true";
      link.dataset.teriockContentLink = "true";
      link.className = "teriock-content-link";
    } else {
      link.href = address;
    }
    link.setAttribute("data-tooltip", `${pageName.replace(":", ": ")}`);
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    let linkText = displayText || pageName;
    if (icon && uuid) {
      const iconEl = document.createElement("i");
      iconEl.className = `fas fa-fw fa-${icon}`;
      link.prepend(iconEl);
    } else {
      link.className = "teriock-not-content-link";
    }
    link.appendChild(document.createTextNode(linkText));
    return link;
  },
  replaceParent: false,
};

/**
 * Enricher to look up data in the document.
 * @type {Teriock.Foundry.TextEditorEnricherConfig}
 */
const lookupEnricher = {
  pattern: /\[\[lookup\s+([^\]\s]+)(?:\s+((?:[^\]\s=]+=[^\]\s=]+\s*)+))?\]\]/gi,
  enricher: async (match, options) => {
    let lookupKey = match[1];
    if (lookupKey.startsWith("@")) {
      lookupKey = lookupKey.slice(1);
    }
    const optionsString = match[2] || "";
    const formatOptions = optionsString
      .trim()
      .split(/\s+/)
      .reduce((acc, curr) => {
        if (!curr) return acc;
        const [key, value] = curr.split("=");
        if (key && value) {
          acc[key] = value;
        }
        return acc;
      }, {});

    const rawValue = foundry.utils.getProperty(options.relativeTo, lookupKey);
    let text = rawValue !== undefined ? String(rawValue) : "";

    if (formatOptions["style"] === "upper") {
      formatOptions["style"] = "uc";
    } else if (formatOptions["style"] === "lower") {
      formatOptions["style"] = "lc";
    } else if (formatOptions["style"] === "embed") {
      const doc = await fromUuid(text);
      if (doc) return doc.toEmbed({});
    } else if (formatOptions["style"] === "link") {
      const doc = await fromUuid(text);
      if (doc) return doc.toAnchor();
    }
    switch ((formatOptions["style"] || "").toLowerCase()) {
      case "uc":
        text = text.toUpperCase();
        break;
      case "lc":
        text = text.toLowerCase();
        break;
      case "title":
        text = toTitleCase(text);
        break;
      case "camel":
        text = toCamelCase(text);
        break;
      case "kebab":
        text = toKebabCase(text);
        break;
      case "ucf":
        text = ucFirst(text);
        break;
    }

    const span = document.createElement("span");
    span.textContent = text;
    return span;
  },
  replaceParent: false,
};

/**
 * Set up custom text enrichers.
 */
export function registerCommandEnrichers() {
  const stringNames = Object.keys(commands);
  CONFIG.TextEditor.enrichers.push({
    pattern: new RegExp(
      `\\[\\[/(?<type>${stringNames.join("|")})(?<config> .*?)?]](?!])(?:{(?<label>[^}]+)})?`,
      "gi",
    ),
    enricher: enrichCommand,
    id: "executeCommand",
    onRender: (el) => {
      if (el.dataset.enriched) return;
      el.dataset.enriched = "true";
      const target = /** @type {HTMLLinkElement} */ el.firstElementChild;
      el.addEventListener("click", async (ev) => {
        await executeCommandFromElement(target, "primary", ev);
      });
      el.addEventListener("contextmenu", async (ev) => {
        await executeCommandFromElement(target, "secondary", ev);
      });
    },
  });
}

/**
 * Find an interaction from a command and execute it.
 * @param {HTMLElement} target
 * @param {"primary" | "secondary"} operation
 * @param {PointerEvent} event
 * @returns {Promise<void>}
 */
async function executeCommandFromElement(target, operation, event) {
  event.preventDefault();
  event.stopPropagation();
  const command = commands[target.dataset.command];
  if (!command || !command[operation]) return;
  const options = {};
  for (const mod of ["alt", "ctrl", "shift"]) {
    if (command[mod] && event[`${mod}Key`]) options[command[mod]] = true;
  }
  for (const [key, value] of Object.entries(target.dataset)) {
    if (!["action", "command"].includes(key)) {
      options[key] = value;
      if (value === "true") options[key] = true;
    }
  }
  let actor;
  if (target.dataset.relativeTo) {
    const doc = await fromUuid(target.dataset.relativeTo);
    actor = doc?.actor;
  }
  if (!actor) actor = game.actors.default;
  await command[operation](actor, options);
}

/**
 * Enrich a command.
 * @param {RegExpMatchArray} match
 * @param {Teriock.Foundry.EnrichmentOptions} options
 * @returns {HTMLAnchorElement}
 */
function enrichCommand(match, options) {
  let { type, config, label = "" } = match.groups;
  const command = commands[type];
  let argumentArray;
  if (command.formula) {
    argumentArray = [["formula", config.trim()]];
  } else {
    argumentArray = parseArguments(config);
  }
  const interactionOptions = interpretArguments(argumentArray, command);
  const link = document.createElement("a");
  link.dataset.command = command.id;
  link.dataset.action = "executeCommand";
  link.dataset.tooltip = getInteractionEntryValue(
    command,
    "tooltip",
    interactionOptions,
  );
  if (!link.dataset.tooltip) {
    link.dataset.tooltip = getInteractionEntryValue(
      command,
      "label",
      interactionOptions,
    );
  }
  if (options.relativeTo) link.dataset.relativeTo = options.relativeTo.uuid;
  for (const [key, value] of Object.entries(interactionOptions)) {
    link.dataset[key] = value.toString();
  }
  link.className = "teriock-inline-command";
  link.prepend(
    makeIconElement(
      getInteractionEntryValue(command, "icon", interactionOptions),
      "inline",
    ),
  );
  if (!label) {
    label = game.i18n.localize(
      getInteractionEntryValue(command, "label", interactionOptions),
    );
  }
  link.appendChild(document.createTextNode(game.i18n.localize(label)));
  return link;
}

/**
 * Register all enrichers.
 */
export default function registerEnrichers() {
  registerCommandEnrichers();
  CONFIG.TextEditor.enrichers.push(wikiLinkEnricher);
  CONFIG.TextEditor.enrichers.push(lookupEnricher);
}
