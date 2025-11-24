import { rollButtons } from "../../constants/display/buttons.mjs";
import { documentOptions } from "../../constants/options/document-options.mjs";

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
 * Create a roll enricher that recognizes all takes in `ROLL_BUTTON_CONFIGS`.
 */
export const makeRollEnricher = (BUTTONS) => {
  const keys = Object.keys(BUTTONS);
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
      const { label, icon } = BUTTONS[typeKey];
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
const wikiLinkEnricher = {
  pattern: /@L\[(.+?)\](?:\{(.+?)\})?/g,
  enricher: async (match, _options) => {
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
 * Register all enrichers.
 */
export default function registerEnrichers() {
  CONFIG.TextEditor.enrichers.push(wikiLinkEnricher);
  CONFIG.TextEditor.enrichers.push(makeRollEnricher(rollButtons));
}
