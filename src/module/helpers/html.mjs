/**
 * Make a CSS class for a given array of elements.
 * @param {Set<Teriock.Keys.Element>} elements
 * @returns {string}
 */
export function elementClass(elements) {
  if (elements.size !== 1) return "es-multi";
  return `es-${Array.from(elements)[0]}`;
}

/**
 * Creates a dialog fieldset for user input.
 * @param {string} legend - The legend text for the fieldset.
 * @param {string} description - The description text for the field.
 * @param {string} name - The name attribute for the input field.
 * @param {number} [max] - The maximum value for the number input.
 * @returns {string} HTML string for the dialog fieldset.
 */
export function createDialogFieldset(legend, description, name, max = Infinity) {
  return `
    <fieldset><legend>${legend}</legend>
      <div>${description}</div>
      <input type="number" name="${name}" value="0" min="0" max="${max}" step="1">
    </fieldset>`;
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
  const button = execution.chatData.system.buttons.find(b => b.dataset);
  if (button) return JSON.parse(button.dataset[useType]);
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
  const button = execution.chatData.system.buttons.find(b => b.dataset);
  if (button) {
    for (const useType of useTypes) {
      button.dataset[useType] = JSON.stringify(consequence);
    }
  }
}

/**
 * Clean a dataset of boolean values.
 * @param {DOMStringMap} dataset
 * @returns {object}
 */
export function cleanDataset(dataset) {
  const options = {};
  for (const [key, value] of Object.entries(dataset)) {
    if (value === "true") {
      options[key] = true;
    } else if (value === "false") {
      options[key] = false;
    } else {
      options[key] = value;
    }
  }
  return options;
}

/**
 * Like querySelectorAll, but includes the root element if it matches.
 * @param {HTMLElement} root
 * @param {string} selector
 * @returns {HTMLElement[]} An array of matching elements (root and descendants).
 */
export function queryAll(root, selector) {
  const result = [];
  if (root.matches(selector)) result.push(root);
  result.push(...root.querySelectorAll(selector));
  return result;
}
