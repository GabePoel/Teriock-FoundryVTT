import { TeriockTextEditor } from "../applications/ux/_module.mjs";
import { documentOptions } from "../constants/options/document-options.mjs";
import { ApplyStatusHandler } from "./interaction/button-handlers/simple-command-handlers.mjs";
import { getImage } from "./path.mjs";
import { toTitleCase } from "./string.mjs";

/**
 * A helper method for constructing an HTML button based on given parameters.
 * @param {Teriock.UI.HTMLButtonConfig} config Options forwarded to the button
 * @returns {HTMLButtonElement}
 */
export function buildHTMLButton(config) {
  let {
    label,
    dataset = /** @type {Record<string, string>} */ {},
    classes = [],
    icon = "",
    type = "button",
    disabled = false,
  } = config;
  const button = document.createElement("button");
  button.type = type;
  for (const [key, value] of Object.entries(dataset)) {
    button.dataset[key] = value;
  }
  button.classList.add(...classes);
  if (icon) {
    icon = `<i class="${icon}"></i> `;
  }
  if (disabled) {
    button.disabled = true;
  }
  button.innerHTML = `${icon}${label}`;
  return button;
}

/**
 * Make a CSS class for a given array of elements.
 * @param {Set<Teriock.Parameters.Ability.Element>} elements
 * @returns {string}
 */
export function elementClass(elements) {
  const colorMap = {
    life: "es-life",
    storm: "es-storm",
    necro: "es-necro",
    flame: "es-flame",
    nature: "es-nature",
  };
  if (elements.size !== 1) {
    return "es-multi";
  } else {
    return colorMap[Array.from(elements)[0]];
  }
}

/**
 * Creates a dialog fieldset for user input.
 * @param {string} legend - The legend text for the fieldset.
 * @param {string} description - The description text for the field.
 * @param {string} name - The name attribute for the input field.
 * @param {number} max - The maximum value for the number input.
 * @returns {string} HTML string for the dialog fieldset.
 */
export function createDialogFieldset(legend, description, name, max) {
  return `
    <fieldset><legend>${legend}</legend>
      <div>${description}</div>
      <input type="number" name="${name}" value="0" min="0" max="${max}" step="1">
    </fieldset>`;
}

/**
 * Make button-handlers for damage types done by some roll.
 * @param {TeriockRoll} roll
 * @returns {Teriock.UI.HTMLButtonConfig[]}
 */
export function makeDamageTypeButtons(roll) {
  const damage = {
    dirtydark: ["terrored"],
    financial: ["hollied", "terrored"],
    fire: ["burned"],
    holy: ["hollied"],
    ice: ["frozen"],
    terror: ["terrored"],
    vine: ["snared"],
  };
  const buttons = [];
  const statuses = new Set();
  for (const term of roll.terms) {
    for (const type of Object.keys(damage)) {
      if (term.flavor.includes(type)) {
        for (const status of damage[type]) {
          statuses.add(status);
        }
      }
    }
  }
  for (const status of statuses) {
    buttons.push(ApplyStatusHandler.buildButton(status));
  }
  return buttons;
}

/**
 * Make a panel for a given damage type.
 * @param damageType
 * @returns {Teriock.MessageData.MessagePanel|null}
 */
export function makeDamageTypePanel(damageType) {
  if (Object.keys(TERIOCK.index.damageTypes).includes(damageType)) {
    return {
      name: TERIOCK.index.damageTypes[damageType] + " Damage",
      image: getImage("damage-types", TERIOCK.index.damageTypes[damageType]),
      icon: TERIOCK.display.icons.effect.damage,
      blocks: [
        {
          title: "Description",
          text: TERIOCK.content.damageTypes[damageType],
        },
      ],
    };
  }
}

/**
 * Make a panel for a given drain type.
 * @param drainType
 * @returns {Teriock.MessageData.MessagePanel|null}
 */
export function makeDrainTypePanel(drainType) {
  if (Object.keys(TERIOCK.index.drainTypes).includes(drainType)) {
    return {
      name: TERIOCK.index.drainTypes[drainType] + " Drain",
      image: getImage("drain-types", TERIOCK.index.drainTypes[drainType]),
      icon: TERIOCK.display.icons.effect.drain,
      blocks: [
        {
          title: "Description",
          text: TERIOCK.content.drainTypes[drainType],
        },
      ],
    };
  }
}

/**
 * Make panels for damage and drain types done by some roll.
 * @param {TeriockRoll} roll
 * @returns {Promise<Teriock.MessageData.MessagePanel[]>}
 */
export async function makeDamageDrainTypePanels(roll) {
  const damageTypes = new Set();
  const drainTypes = new Set();
  for (const term of roll.terms) {
    for (const type of Object.keys(TERIOCK.index.damageTypes)) {
      if (term.flavor.includes(type)) {
        damageTypes.add(type);
      }
    }
    for (const type of Object.keys(TERIOCK.index.drainTypes)) {
      if (term.flavor.includes(type)) {
        drainTypes.add(type);
      }
    }
  }
  /** @type {Teriock.MessageData.MessagePanel[]} */
  const panels = [];
  if (roll.options.flavor?.toLowerCase().includes("damage")) {
    for (const damageType of damageTypes) {
      const panel = makeDamageTypePanel(damageType);
      if (panel) {
        panels.push(await TeriockTextEditor.enrichPanel(panel));
      }
    }
  }
  if (roll.options.flavor?.toLowerCase().includes("drain")) {
    for (const drainType of drainTypes) {
      const panel = makeDrainTypePanel(drainType);
      if (panel) {
        panels.push(await TeriockTextEditor.enrichPanel(panel));
      }
    }
  }
  return panels;
}

/**
 * Remove trailing lines from HTML.
 * @param {string} html
 * @returns {string}
 */
export function trimTrailingLinesHTML(html) {
  const box = document.createElement("div");
  box.innerHTML = html;
  const isBlank = (n) => {
    if (n.nodeType === 3) {
      return !n.nodeValue.replace(/\u00A0/g, " ").trim();
    }
    if (n.nodeType === 1) {
      if (n.matches("br")) {
        return true;
      }
      if (n.matches("p,div")) {
        const txt = n.textContent.replace(/\u00A0/g, " ").trim();
        return !txt || n.classList.contains("mw-empty-elt");
      }
    }
    return false;
  };
  while (box.lastChild && isBlank(box.lastChild)) {
    box.removeChild(box.lastChild);
  }
  if (box.querySelector("p")) {
    return box.querySelector("p").innerHTML.trim();
  }
  return box.innerHTML.trim();
}

/**
 * Turn spans into normal text.
 * @param {string} html
 * @returns {string}
 */
export function removeSpansFromHTML(html) {
  const d = document.createElement("div");
  d.innerHTML = html;
  d.querySelectorAll("span").forEach((s) => s.replaceWith(...s.childNodes));
  return d.innerHTML;
}

/**
 * Make HTML more tidy.
 * @param {string} html
 * @returns {string}
 */
export function tidyHTML(html) {
  return trimTrailingLinesHTML(removeSpansFromHTML(html));
}

/**
 * Get the panel for an attribute.
 * @param {Teriock.Parameters.Actor.Attribute} attribute
 * @returns {Promise<Teriock.MessageData.MessagePanel>}
 */
export async function attributePanel(attribute) {
  return TeriockTextEditor.enrichPanel({
    image: getImage("attributes", TERIOCK.index.attributesFull[attribute]),
    name: TERIOCK.index.attributesFull[attribute],
    blocks: [
      {
        title: "Description",
        text: TERIOCK.data.attributes[attribute],
      },
    ],
    icon: TERIOCK.display.icons.interaction.feat,
    label: "Attribute",
  });
}

/**
 * Get the panel for a tradecraft.
 * @param {Teriock.Parameters.Fluency.Tradecraft} tradecraft
 * @returns {Promise<Teriock.MessageData.MessagePanel>}
 */
export async function tradecraftPanel(tradecraft) {
  let field;
  for (const [key, value] of Object.entries(TERIOCK.options.tradecraft)) {
    if (Object.keys(value.tradecrafts).includes(tradecraft)) {
      field = key;
    }
  }
  return TeriockTextEditor.enrichPanel({
    image: getImage("tradecrafts", TERIOCK.index.tradecrafts[tradecraft]),
    name: TERIOCK.index.tradecrafts[tradecraft],
    bars: [
      {
        icon: TERIOCK.options.tradecraft[field].icon,
        label: "Field",
        wrappers: [TERIOCK.options.tradecraft[field].name],
      },
    ],
    blocks: [
      {
        title: "Description",
        text: TERIOCK.content.tradecrafts[tradecraft],
      },
    ],
    icon: documentOptions.fluency.icon,
    label: "Tradecraft",
  });
}

/**
 * Get the panel for a class.
 * @param {Teriock.Parameters.Rank.RankClass} className
 * @returns {Promise<Teriock.MessageData.MessagePanel>}
 */
export async function classPanel(className) {
  let archetype;
  for (const [key, value] of Object.entries(TERIOCK.options.rank)) {
    if (Object.keys(value.classes).includes(className)) {
      archetype = key;
    }
  }
  return await TeriockTextEditor.enrichPanel({
    image: getImage("classes", TERIOCK.index.classes[className]),
    name: TERIOCK.index.classes[className],
    bars: [
      {
        icon: TERIOCK.options.rank[archetype].icon,
        label: "Archetype",
        wrappers: [TERIOCK.options.rank[archetype].name],
      },
    ],
    blocks: [
      {
        title: "Description",
        text: TERIOCK.content.classes[className],
      },
    ],
    icon: documentOptions.rank.icon,
    label: "Class",
  });
}

/**
 * Parse a string of HTML as an element.
 * @param {string} htmlString
 * @returns {HTMLElement}
 */
export function safeParseHTML(htmlString) {
  htmlString = htmlString || "";
  let htmlElement = foundry.utils.parseHTML(htmlString);
  if (!(htmlElement instanceof HTMLElement)) {
    htmlElement = document.createElement("div");
    htmlElement.innerHTML = htmlString;
  }
  return htmlElement;
}

//noinspection JSUnusedGlobalSymbols
/**
 * Unpack the consequence of the "apply effect" button.
 * @param {AbilityExecution} execution
 * @param {object} [options]
 * @param {"normal"|"crit"} [options.useType]
 * @returns {TeriockConsequence | null}
 */
export function unpackEffectButton(execution, options = {}) {
  const { useType = "normal" } = options;
  const button = execution.chatData.system.buttons.find((b) => b.dataset);
  if (button) {
    return JSON.parse(button.dataset[useType]);
  }
  return null;
}

//noinspection JSUnusedGlobalSymbols
/**
 * Pack the consequence of the "apply effect" button.
 * @param {AbilityExecution} execution
 * @param {TeriockConsequence} consequence
 * @param {object} [options]
 * @param {string[]} [options.useTypes]
 */
export function packEffectButton(execution, consequence, options = {}) {
  const { useTypes = ["normal", "crit"] } = options;
  const button = execution.chatData.system.buttons.find((b) => b.dataset);
  if (button) {
    for (const useType of useTypes) {
      button.dataset[useType] = JSON.stringify(consequence);
    }
  }
}

/**
 * Add trackers to the roll config.
 * @param {AbilityExecution} execution
 * @param {string} key
 * @param {UUID<TeriockTokenDocument|TeriockActor>[]} uuids
 * @returns {Promise<void>}
 */
export async function addTrackersToExecution(execution, key, uuids) {
  let titleString = toTitleCase(key) + " To";
  if (key === "frightened") {
    titleString = "Frightened Of";
  }
  if (key === "dueling") {
    titleString = "Dueling With";
  }
  const buttons = execution.buttons;
  const button = buttons.find((b) => b.dataset.action === "apply-effect");
  if (button) {
    for (const useType of ["normal", "crit"]) {
      if (button.dataset[useType]) {
        /** @type {TeriockConsequence} */
        const effectObject = JSON.parse(button.dataset[useType]);
        /** @type {Teriock.MessageData.MessageAssociation} */
        const association = {
          title: titleString,
          icon: TERIOCK.options.document.creature.icon,
          cards: [],
        };
        for (const uuid of uuids) {
          effectObject.system.impacts.changes.push({
            key: `system.conditionInformation.${key}.trackers`,
            value: uuid,
            mode: 2,
            priority: 10,
          });
          const doc = fromUuidSync(uuid);
          association.cards.push({
            name: doc.name,
            img: doc.texture?.src,
            uuid: uuid,
            rescale: doc.rescale,
            id: doc.id,
            type: "base",
          });
        }
        effectObject.system.associations.push(association);
        button.dataset[useType] = JSON.stringify(effectObject);
      }
    }
  }
}

/**
 * Add a tracker to roll config.
 * @param {AbilityExecution} execution
 * @param {string} tracker
 * @param {UUID<TeriockTokenDocument|TeriockActor>} uuid
 * @returns {Promise<void>}
 */
export async function addTrackerToExecution(execution, tracker, uuid) {
  await addTrackersToExecution(execution, tracker, [uuid]);
}

/**
 * Quickly turn a {@link TeriockDocument} array into an association.
 * @param {TeriockDocument[]} docs
 * @param {string} title
 * @param {string} icon
 * @param {Array} associations
 * @param {object} options
 * @param {boolean} [options.makeTooltip]
 */
export function quickAddAssociation(
  docs,
  title,
  icon,
  associations,
  options = { makeTooltip: true },
) {
  if (docs.length > 0) {
    const association = {
      title: title,
      icon: icon,
      cards: docs.map((d) => {
        return {
          color: d.system.color,
          icon: d.system.tagIcon,
          id: d._id,
          img: d.img,
          makeTooltip: options.makeTooltip,
          name: d.system.nameString || d.name,
          rescale: false,
          type: d.documentName,
          uuid: d.uuid,
        };
      }),
    };
    associations.push(association);
  }
}
