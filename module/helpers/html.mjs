/**
 * A helper method for constructing an HTML button based on given parameters.
 *
 * @param {Teriock.HTMLButtonConfig} config Options forwarded to the button
 * @returns {HTMLButtonElement}
 */
export function buildHTMLButton({ label, dataset = {}, classes = [], icon = "", type = "button", disabled = false }) {
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
  const validElements = elements.filter((el) => Object.prototype.hasOwnProperty.call(colorMap, el));
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