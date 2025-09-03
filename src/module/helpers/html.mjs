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
  let statuses = new Set();
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
      label: `Apply ${CONFIG.TERIOCK.index.conditions[status]}`,
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
