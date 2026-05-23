import { wikiConfig } from "../../constants/config/wiki-config.mjs";
import { icons } from "../../constants/display/icons.mjs";
import { createElement } from "../../helpers/html.mjs";
import {
  commands,
  getInteractionEntryValue,
  interpretArguments,
  parseArguments,
} from "../../helpers/interaction/_module.mjs";
import { toCamelCase, toKebabCase, toTitleCase, ucFirst } from "../../helpers/string.mjs";
import { makeIconClass, makeIconElement, objectMap, parseIdentifier } from "../../helpers/utils.mjs";
import { wikiToUuid } from "../../helpers/wiki.mjs";
import { TeriockTextEditor } from "./_module.mjs";

const IDENTIFIER_ICON_MAP = Object.fromEntries(
  Object.values(wikiConfig.namespaces).filter(c => c.identifierType && c.icon).map(c => [c.identifierType, c.icon]),
);

/**
 * Wiki link enricher. Designed to mimic the `@EMBED` and `@UUID` enrichers as well as the `{{L}}` wiki syntax.
 * @type {TextEditorEnricherConfig}
 */
const wikiLinkEnricher = {
  pattern: /@L\[(.+?)\](?:\{(.+?)\})?/g,
  replaceParent: false,
  enricher: async match => {
    const pageName = match[1];
    let displayText = match[2];
    const namespace = pageName.split(":")[0];
    let name = pageName.split(":")[1];

    if (!displayText) displayText = name;
    if (Object.keys(TERIOCK.aliases[namespace.toLowerCase()] || {}).includes(name))
      name = TERIOCK.aliases[namespace.toLowerCase()][name];

    const urlPageName = pageName.replace(/ /g, "_");
    const address = `https://wiki.teriock.com/index.php/${urlPageName}`;
    const uuid = await wikiToUuid(namespace, name);
    const icon = wikiConfig.namespaces[namespace]?.icon || icons.ui.wiki;

    const linkAttributes = {
      dataset: { tooltip: pageName.replace(":", ": ") },
      rel: "noopener noreferrer",
      target: "_blank",
    };

    if (uuid) {
      const parsed = foundry.utils.parseUuid(uuid);
      foundry.utils.mergeObject(linkAttributes, {
        className: "teriock-content-link",
        dataset: {
          id: parsed.id,
          link: "",
          makeTooltip: "true",
          pack: parsed.collection?.collection,
          teriockContentLink: "true",
          type: parsed.type,
          uuid,
          wikiAddress: address,
          wikiContext: "true",
        },
        draggable: true,
      }, { inplace: true });
    } else {
      foundry.utils.mergeObject(linkAttributes, { className: "teriock-not-content-link", href: address }, {
        inplace: true,
      });
    }

    const link = createElement("a", linkAttributes);
    const linkText = displayText || pageName;

    if (icon && uuid) {
      const iconEl = createElement("i", { className: makeIconClass(icon, "solid").replace(/\bfa-fw\b/g, "").trim() });
      link.append(iconEl, linkText);
    } else {
      link.append(linkText);
    }

    return link;
  },
};

/**
 * Identifier link enriched. Designed to mimic `@UUID` by calling `@I`.
 * @type {TextEditorEnricherConfig}
 */
const identifierEnricher = {
  pattern: /@I\[(.+?)\](?:\{(.+?)\})?/g,
  replaceParent: false,
  enricher: async match => {
    await game.teriock.identifiers.ready;
    const contentLinkMatch = [null, "UUID", game.teriock.identifiers.get(match[1]), "", match[2]];
    const out = await TeriockTextEditor._createContentLink(contentLinkMatch);
    const parsed = parseIdentifier(match[1]);
    if (parsed && IDENTIFIER_ICON_MAP[parsed.type]) {
      const iconClass = makeIconClass(IDENTIFIER_ICON_MAP[parsed.type], "solid");
      out.querySelectorAll("i").forEach(icon => {
        icon.className = iconClass;
      });
    }
    return out;
  },
};

/**
 * Enricher to look up data in the document.
 * @type {TextEditorEnricherConfig}
 */
const lookupEnricher = {
  pattern: /\[\[lookup\s+([^\]\s]+)(?:\s+((?:[^\]\s=]+=[^\]\s=]+\s*)+))?\]\]/gi,
  replaceParent: false,
  enricher: async (match, options) => {
    let lookupKey = match[1];
    if (lookupKey.startsWith("@")) lookupKey = lookupKey.slice(1);
    const optionsString = match[2] || "";
    const formatOptions = optionsString.trim().split(/\s+/).reduce((acc, curr) => {
      if (!curr) return acc;
      const [key, value] = curr.split("=");
      if (key && value) acc[key] = value;
      return acc;
    }, {});

    const rawValue = foundry.utils.getProperty(options.relativeTo, lookupKey);
    let text = rawValue !== undefined ? String(rawValue) : "";

    if (formatOptions["style"] === "upper") formatOptions["style"] = "uc";
    else if (formatOptions["style"] === "lower") formatOptions["style"] = "lc";
    else if (formatOptions["style"] === "embed") {
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

    return createElement("span", { textContent: text });
  },
};

/**
 * Set up custom text enrichers.
 */
export function registerCommandEnrichers() {
  const stringNames = Object.keys(commands);
  CONFIG.TextEditor.enrichers.push({
    enricher: enrichCommand,
    id: "executeCommand",
    pattern: new RegExp(`\\[\\[/(?<type>${stringNames.join("|")})(?<config> .*?)?]](?!])(?:{(?<label>[^}]+)})?`, "gi"),
    onRender: el => {
      if (el.dataset.enriched) return;
      el.dataset.enriched = "true";
      const target = /** @type {HTMLLinkElement} */ el.firstElementChild;
      el.addEventListener("click", async ev => {
        await executeCommandFromElement(target, "primary", ev);
      });
      el.addEventListener("contextmenu", async ev => {
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
  for (const mod of ["alt", "ctrl", "shift"]) if (command[mod] && event[`${mod}Key`]) options[command[mod]] = true;
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
 * @param {EnrichmentOptions} options
 * @returns {HTMLAnchorElement}
 */
function enrichCommand(match, options = {}) {
  const { config, type } = match.groups;
  let { label = "" } = match.groups;
  const command = commands[type];
  let argumentArray;
  if (command.formula) argumentArray = [["formula", config.trim()]];
  else argumentArray = parseArguments(config);
  const interactionOptions = interpretArguments(argumentArray, command);
  const link = createElement("a", {
    className: "teriock-inline-command",
    dataset: {
      action: "executeCommand",
      command: command.id,
      relativeTo: options.relativeTo?.uuid,
      tooltip: getInteractionEntryValue(command, "tooltip", interactionOptions)
        || getInteractionEntryValue(command, "label", interactionOptions),
      ...objectMap(interactionOptions, v => v.toString()),
    },
  });
  link.prepend(makeIconElement(getInteractionEntryValue(command, "icon", interactionOptions), "inline"));
  if (!label) label = _loc(getInteractionEntryValue(command, "label", interactionOptions));
  link.appendChild(document.createTextNode(_loc(label)));
  return link;
}

/**
 * Register all enrichers.
 */
export default function registerEnrichers() {
  registerCommandEnrichers();
  CONFIG.TextEditor.enrichers.push(wikiLinkEnricher);
  CONFIG.TextEditor.enrichers.push(lookupEnricher);
  CONFIG.TextEditor.enrichers.push(identifierEnricher);
}
