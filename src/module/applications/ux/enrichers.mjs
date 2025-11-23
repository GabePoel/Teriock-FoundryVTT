import { rollButtons } from "../../constants/display/buttons.mjs";
import { documentOptions } from "../../constants/options/document-options.mjs";
import { getAbility } from "../../helpers/fetch.mjs";
import { dedent } from "../../helpers/utils.mjs";

const enricherIcons = {
  Core: "book",
  Keyword: "quote-left",
  Damage: "heart-crack",
  Drain: "droplet-slash",
  Condition: documentOptions.effect.icon,
  Property: documentOptions.property.icon,
  Tradecraft: documentOptions.fluency.icon,
  Class: documentOptions.rank.icon,
};

const rulesEnrichers = Object.keys(enricherIcons).map((type) => ({
  pattern: new RegExp(`@${type}\\[(.+?)\\](?:\\{(.+?)\\})?`, "g"),
  enricher: async (match, _options) => {
    const fileName = match[1];
    const title = match[2];

    const compendiumIndex = game.teriock.packs.rules.index.getName(type);
    if (!compendiumIndex) {
      return null;
    }

    const compendium = await fromUuid(compendiumIndex.uuid);
    if (!compendium) {
      return null;
    }

    const page = compendium.pages.getName(fileName);
    if (!page) {
      return null;
    }

    const uuid = page.uuid;
    if (!uuid) {
      return null;
    }

    const wrapper = document.createElement("div");
    wrapper.innerHTML = `<a class="content-link" draggable="true" data-link="" data-uuid="${uuid}" data-id="${uuid.slice(-16)}" data-tooltip="${fileName}">
      <i class="fa-solid fa-${enricherIcons[type]}"></i>${title || fileName}</a>`;

    return wrapper.firstElementChild;
  },
  replaceParent: false,
}));

const abilityEnricher = {
  pattern: /@Ability\[(.+?)\](?:\{(.+?)\})?/g,
  enricher: async (match, _options) => {
    const fileName = match[1];
    const title = match[2];
    const ability = await getAbility(fileName);
    if (!ability) {
      return null;
    }
    const uuid = ability.uuid;
    if (!uuid) {
      return null;
    }
    const wrapper = document.createElement("div");
    wrapper.innerHTML = dedent(`
      <a
        class="content-link"
        draggable="true"
        data-link=""
        data-uuid="${uuid}"
        data-id="${uuid.slice(-16)}"
        data-tooltip="${fileName}"
      ><i class="fa-solid fa-${TERIOCK.options.document.ability.icon}"></i>${title || fileName}</a>`);
    return wrapper.firstElementChild;
  },
  replaceParent: false,
};

const classEnricher = {
  pattern: /@Class\[(.+?)\](?:\{(.+?)\})?/g,
  enricher: async (match, _options) => {
    const fileName = match[1];
    let title = match[2];
    if (!title) {
      title = fileName;
    }
    const uuid = game.teriock.packs.classes.index.getName(
      `Rank 1 ${fileName}`,
    ).uuid;
    const wrapper = document.createElement("div");
    wrapper.innerHTML = dedent(`
      <a
        class="content-link"
        draggable="true"
        data-link=""
        data-uuid="${uuid}"
        data-id="${uuid.slice(-16)}"
        data-tooltip="${fileName}"
      ><i class="fa-solid fa-${TERIOCK.options.document.rank.icon}"></i>${title || fileName}</a>`);
    return wrapper.firstElementChild;
  },
  replaceParent: false,
};

const rankEnricher = {
  pattern: /@Rank\[(.+?)\](?:\{(.+?)\})?/g,
  enricher: async (match, _options) => {
    let fileName = match[1];
    const title = match[2];
    if (!fileName.includes("Rank")) {
      fileName = `Rank 1 ${fileName}`;
    }
    const uuid = game.teriock.packs.classes.index.getName(fileName).uuid;
    const wrapper = document.createElement("div");
    wrapper.innerHTML = dedent(`
      <a
        class="content-link"
        draggable="true"
        data-link=""
        data-uuid="${uuid}"
        data-id="${uuid.slice(-16)}"
        data-tooltip="${fileName}"
      ><i class="fa-solid fa-${TERIOCK.options.document.rank.icon}"></i>${title || fileName}</a>`);
    return wrapper.firstElementChild;
  },
  replaceParent: false,
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

const equipmentEnricher = {
  pattern: /@Equipment\[(.+?)\](?:\{(.+?)\})?/g,
  enricher: async (match, _options) => {
    const fileName = match[1];
    const title = match[2];
    const uuid = game.teriock.packs.equipment.index.getName(fileName).uuid;
    const wrapper = document.createElement("div");
    wrapper.innerHTML = dedent(`
      <a
        class="content-link"
        draggable="true"
        data-link=""
        data-uuid="${uuid}"
        data-id="${uuid.slice(-16)}"
        data-tooltip="${fileName}"
      ><i class="fa-solid fa-${TERIOCK.options.document.equipment.icon}"></i>${title || fileName}</a>`);
    return wrapper.firstElementChild;
  },
  replaceParent: false,
};

const wikiEnricher = {
  pattern: /@Wiki\[(.+?)\](?:\{(.+?)\})?/g,
  enricher: async (match, _options) => {
    const pageName = match[1];
    const displayText = match[2];
    const urlPageName = pageName.replace(/ /g, "_");
    const link = document.createElement("a");
    link.href = `https://wiki.teriock.com/index.php/${urlPageName}`;
    link.className = "content-link";
    link.setAttribute("data-tooltip", pageName);
    const icon = document.createElement("i");
    icon.className = "fa-solid fa-globe";
    link.appendChild(icon);
    link.appendChild(document.createTextNode(displayText || pageName));
    return link;
  },
  replaceParent: false,
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
  rulesEnrichers.forEach((e) => CONFIG.TextEditor.enrichers.push(e));
  CONFIG.TextEditor.enrichers.push(abilityEnricher);
  CONFIG.TextEditor.enrichers.push(classEnricher);
  CONFIG.TextEditor.enrichers.push(equipmentEnricher);
  CONFIG.TextEditor.enrichers.push(rankEnricher);
  CONFIG.TextEditor.enrichers.push(wikiEnricher);
  CONFIG.TextEditor.enrichers.push(wikiLinkEnricher);
  CONFIG.TextEditor.enrichers.push(makeRollEnricher(rollButtons));
}
