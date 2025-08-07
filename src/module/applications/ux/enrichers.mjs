import { documentOptions } from "../../helpers/constants/document-options.mjs";

const enricherIcons = {
  Core: "circle-info",
  Keyword: "quote-left",
  Damage: "heart",
  Drain: "brain",
  Condition: documentOptions.effect.icon,
  Property: documentOptions.property.icon,
  Tradecraft: documentOptions.fluency.icon,
};

const rulesEnrichers = Object.keys(enricherIcons).map((type) => ({
  pattern: new RegExp(`@${type}\\[(.+?)\\](?:\\{(.+?)\\})?`, "g"),
  enricher: async (match, _options) => {
    const fileName = match[1];
    const title = match[2];

    const compendiumIndex = game.teriock.packs.rules().index.getName(type);
    if (!compendiumIndex) return null;

    const compendium = await foundry.utils.fromUuid(compendiumIndex.uuid);
    if (!compendium) return null;

    const page = compendium.pages.getName(fileName);
    if (!page) return null;

    const uuid = page.uuid;
    if (!uuid) return null;

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
    const itemWrapper = await foundry.utils.fromUuid(
      game.teriock.packs.essentials().index.getName(fileName).uuid,
    );
    if (!itemWrapper) return null;
    const ability = itemWrapper.effects.getName(fileName);
    if (!ability) return null;
    const uuid = ability.uuid;
    if (!uuid) return null;
    const wrapper = document.createElement("div");
    wrapper.innerHTML = `<a class="content-link" draggable="true" data-link="" data-uuid="${uuid}" data-id="${uuid.slice(-16)}" data-tooltip="${fileName}"><i class="fa-solid fa-${documentOptions.ability.icon}"></i>${title || fileName}</a>`;
    return wrapper.firstElementChild;
  },
  replaceParent: false,
};

const classEnricher = {
  pattern: /@Class\[(.+?)\](?:\{(.+?)\})?/g,
  enricher: async (match, _options) => {
    const fileName = match[1];
    let title = match[2];
    if (!title) title = fileName;
    const uuid = game.teriock.packs
      .classes()
      .index.getName(`Rank 1 ${fileName}`).uuid;
    const wrapper = document.createElement("div");
    wrapper.innerHTML = `<a class="content-link" draggable="true" data-link="" data-uuid="${uuid}" data-id="${uuid.slice(-16)}" data-tooltip="${fileName}"><i class="fa-solid fa-${documentOptions.rank.icon}"></i>${title || fileName}</a>`;
    return wrapper.firstElementChild;
  },
  replaceParent: false,
};

const rankEnricher = {
  pattern: /@Rank\[(.+?)\](?:\{(.+?)\})?/g,
  enricher: async (match, _options) => {
    let fileName = match[1];
    const title = match[2];
    if (!fileName.includes("Rank")) fileName = `Rank 1 ${fileName}`;
    const uuid = game.teriock.packs.classes().index.getName(fileName).uuid;
    const wrapper = document.createElement("div");
    wrapper.innerHTML = `<a class="content-link" draggable="true" data-link="" data-uuid="${uuid}" data-id="${uuid.slice(-16)}" data-tooltip="${fileName}"><i class="fa-solid fa-${documentOptions.rank.icon}"></i>${title || fileName}</a>`;
    return wrapper.firstElementChild;
  },
  replaceParent: false,
};

const equipmentEnricher = {
  pattern: /@Equipment\[(.+?)\](?:\{(.+?)\})?/g,
  enricher: async (match, _options) => {
    const fileName = match[1];
    const title = match[2];
    const uuid = game.teriock.packs.equipment().index.getName(fileName).uuid;
    const wrapper = document.createElement("div");
    wrapper.innerHTML = `<a class="content-link" draggable="true" data-link="" data-uuid="${uuid}" data-id="${uuid.slice(-16)}" data-tooltip="${fileName}"><i class="fa-solid fa-${documentOptions.equipment.icon}"></i>${title || fileName}</a>`;
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
    if (!displayText) displayText = pageName.split(":")[1];
    const urlPageName = pageName.replace(/ /g, "_");
    const link = document.createElement("a");
    link.href = `https://wiki.teriock.com/index.php/${urlPageName}`;
    link.setAttribute("data-tooltip", pageName);
    link.appendChild(document.createTextNode(displayText || pageName));
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
}
