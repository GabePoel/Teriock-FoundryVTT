import { buildMessage } from "./messages-builder/message-builder.mjs";
import { getIcon } from "./path.mjs";

const { TextEditor } = foundry.applications.ux;

/**
 * A helper method for constructing an HTML button based on given parameters.
 *
 * @param {Teriock.UI.HTMLButtonConfig} config Options forwarded to the button
 * @returns {HTMLButtonElement}
 */
export function buildHTMLButton({
  label,
  dataset = {},
  classes = [],
  icon = "",
  type = "button",
  disabled = false,
}) {
  const button = document.createElement("button");
  button.type = type;
  for (const [key, value] of Object.entries(dataset)) {
    button.dataset[key] = value;
  }
  button.classList.add(...classes);
  if (icon) icon = `<i class="${icon}"></i> `;
  if (disabled) button.disabled = true;
  button.innerHTML = `${icon}${label}`;
  return button;
}

/**
 * Make a CSS class for a given array of elements.
 *
 * @param {string[]} elements
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
  if (!Array.isArray(elements)) return "es-multi";
  const validElements = elements.filter((el) =>
    Object.prototype.hasOwnProperty.call(colorMap, el),
  );
  if (validElements.length !== 1) return "es-multi";
  return colorMap[validElements[0]] || "es-multi";
}

/**
 * Creates a dialog fieldset for user input.
 *
 * @param {string} legend - The legend text for the fieldset.
 * @param {string} description - The description text for the field.
 * @param {string} name - The name attribute for the input field.
 * @param {number} max - The maximum value for the number input.
 * @returns {string} HTML string for the dialog fieldset.
 * @private
 */
export function createDialogFieldset(legend, description, name, max) {
  return `
    <fieldset><legend>${legend}</legend>
      <div>${description}</div>
      <input type="number" name="${name}" value="0" min="0" max="${max}" step="1">
    </fieldset>`;
}

/**
 * Add an Elder Sorcery mask to the given element if possible.
 *
 * @param {HTMLDivElement} element
 * @param {TeriockAbility} ability
 * @returns {HTMLDivElement} The modified element.
 */
export function insertElderSorceryMask(element, ability) {
  const esMask = elderSorceryMask(ability);
  if (esMask) {
    element.insertAdjacentElement("afterbegin", esMask);
  }
  return element;
}

/**
 * Makes an Elder Sorcery mask if possible.
 *
 * @param {TeriockAbility} ability
 * @returns {HTMLDivElement|null}
 */
export function elderSorceryMask(ability) {
  if (ability.system.elderSorcery) {
    const esMaskContainer = document.createElement("div");
    esMaskContainer.classList.add("es-mask-container");
    const esMaskRotator = document.createElement("div");
    esMaskRotator.classList.add("es-mask-rotator");
    const esMaskOverlay = document.createElement("div");
    esMaskOverlay.classList.add("es-mask-overlay");
    esMaskOverlay.classList.add(elementClass(ability.system.elements));
    esMaskContainer.appendChild(esMaskRotator);
    esMaskContainer.appendChild(esMaskOverlay);
    return esMaskContainer;
  }
  return null;
}

/**
 * Add click event listeners to multiple elements.
 *
 * @param {NodeList} elements - Collection of DOM elements to add listeners to
 * @param {Function} handler - Click event handler function
 * @returns {void}
 */
export function addClickHandler(elements, handler) {
  elements.forEach((element) => {
    if (element) {
      element.addEventListener("click", handler);
    }
  });
}

/**
 * Make buttons for damage types done by some roll.
 * @param {TeriockRoll} roll
 * @returns {Teriock.UI.HTMLButtonConfig[]}
 */
export function makeDamageTypeButtons(roll) {
  const damage = {
    fire: ["burned"],
    holy: ["hollied"],
    ice: ["frozen"],
    terror: ["terrored"],
    vine: ["snared"],
    financial: ["hollied", "terrored"],
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
    buttons.push({
      label: `Apply ${TERIOCK.index.conditions[status]}`,
      icon: "fas fa-plus",
      dataset: {
        action: "apply-status",
        status: status,
      },
    });
  }
  return buttons;
}

/**
 * Make text for damage and drain types done by some roll.
 * @param roll
 * @returns {Promise<string>}
 */
export async function makeDamageDrainTypeMessage(roll) {
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
  if (damageTypes.has("lethal")) drainTypes.delete("lethal");
  const blocks = [];
  for (const damageType of damageTypes) {
    blocks.push({
      title: TERIOCK.index.damageTypes[damageType] + " Damage",
      text: TERIOCK.content.damageTypes[damageType],
      italic: true,
    });
  }
  for (const drainType of drainTypes) {
    blocks.push({
      title: TERIOCK.index.drainTypes[drainType] + " Drain",
      text: TERIOCK.content.drainTypes[drainType],
      italic: true,
    });
  }
  const messageParts = {
    blocks: blocks,
  };
  const content = buildMessage(messageParts);
  const messageRaw = `<div class="teriock">${content.outerHTML}</div>`;
  return await TextEditor.enrichHTML(messageRaw);
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
      if (n.matches("br")) return true;
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
  return box.innerHTML;
}

/**
 * Turn spans into normal text.
 * @param {string} html
 * @returns {string}
 */
export function unspanHTML(html) {
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
  return trimTrailingLinesHTML(unspanHTML(html));
}

/**
 * Get the message for a tradecraft.
 * @param {Teriock.Parameters.Fluency.Tradecraft} tradecraft
 * @returns {Promise<string>}
 */
export async function tradecraftMessage(tradecraft) {
  let field;
  for (const [key, value] of Object.entries(
    TERIOCK.options.tradecraft,
  )) {
    if (Object.keys(value.tradecrafts).includes(tradecraft)) {
      field = key;
    }
  }
  const messageContent = buildMessage({
    image: getIcon("tradecrafts", TERIOCK.index.tradecrafts[tradecraft]),
    name: TERIOCK.index.tradecrafts[tradecraft],
    bars: [
      {
        icon: "fa-" + TERIOCK.options.tradecraft[field].icon,
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
  });
  const message = document.createElement("div");
  message.append(messageContent);
  message.classList.add("teriock");

  return await TextEditor.enrichHTML(message.innerHTML);
}

/**
 * Get the message for a class.
 * @param {Teriock.Parameters.Rank.RankClass} className
 * @returns {Promise<string>}
 */
export async function classMessage(className) {
  let archetype;
  for (const [key, value] of Object.entries(TERIOCK.options.rank)) {
    if (Object.keys(value.classes).includes(className)) {
      archetype = key;
    }
  }
  const messageContent = buildMessage({
    image: getIcon("classes", TERIOCK.index.classes[className]),
    name: TERIOCK.index.classes[className],
    bars: [
      {
        icon: "fa-" + TERIOCK.options.rank[archetype].icon,
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
  });
  const message = document.createElement("div");
  message.append(messageContent);
  message.classList.add("teriock");
  return await TextEditor.enrichHTML(message.innerHTML);
}
