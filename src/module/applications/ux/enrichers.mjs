import { rollButtons } from "../../constants/display/buttons.mjs";
import { documentOptions } from "../../constants/options/document-options.mjs";
import {
  toCamelCase,
  toKebabCase,
  toTitleCase,
} from "../../helpers/string.mjs";

const enricherIcons = {
  Core: "book",
  Keyword: "quote-left",
  Damage: "heart-crack",
  Drain: "droplet-slash",
  Tradecraft: documentOptions.fluency.icon,
  Class: documentOptions.rank.icon,
};

/** Generic enricher for `[[/<take> <formula>]]` */
const escapeRx = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Create a roll enricher that recognizes all roll button takes.
 * @type {(buttons: Record<string, Teriock.UI.ButtonDefinition>) => Teriock.Foundry.TextEditorEnricherConfig}
 */
const makeRollEnricher = (buttons) => {
  const keys = Object.keys(buttons);
  const lookup = Object.fromEntries(keys.map((k) => [k.toLowerCase(), k]));
  const keyAlt = keys.map(escapeRx).join("|");
  const any = "([^]*)";
  const source = String.raw`\[\[\s*\/(${keyAlt})\s+${any}?\s*\]\]`;
  const pattern = new RegExp(source, "gi");
  return {
    pattern,
    enricher: async (match) => {
      const typeKey = lookup[match[1].toLowerCase()];
      if (!typeKey) {
        return null;
      }
      const formula = (match[2] ?? "").trim();
      const { label, icon } = buttons[typeKey];
      const a = document.createElement("a");
      a.className = "content-link";
      a.draggable = false;
      a.dataset.action = "roll-rollable-take";
      a.dataset.type = typeKey;
      a.dataset.formula = formula;
      a.dataset.tooltip = label;
      const i = document.createElement("i");
      i.className = icon;
      a.append(i, " ", formula);
      return a;
    },
    replaceParent: false,
  };
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
        text = text.charAt(0).toUpperCase() + text.slice(1);
        break;
    }

    const span = document.createElement("span");
    span.textContent = text;
    return span;
  },
  replaceParent: false,
};

/**
 * Register all enrichers.
 */
export default function registerEnrichers() {
  CONFIG.TextEditor.enrichers.push(wikiLinkEnricher);
  CONFIG.TextEditor.enrichers.push(makeRollEnricher(rollButtons));
  CONFIG.TextEditor.enrichers.push(lookupEnricher);
}
