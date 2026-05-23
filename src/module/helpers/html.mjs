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
export function createDialogInput(legend, description, name, max = Infinity) {
  const field = new foundry.data.fields.NumberField({
    integer: true,
    max,
    min: 0,
    nullable: false,
    placeholder: "0",
    step: 1,
  });
  const formGroup = field.toFormGroup({ hint: "TEMP", label: legend }, {
    name,
    rootId: foundry.utils.randomID(),
    value: 0,
  });
  formGroup.querySelectorAll(".hint").forEach(hint =>
    hint.replaceWith(createElement("div", { className: "hint", innerHTML: description }))
  );
  return formGroup.outerHTML;
}

/**
 * Clean a dataset of boolean values.
 * @param {DOMStringMap} dataset
 * @returns {object}
 */
export function cleanDataset(dataset) {
  const options = {};
  for (const [key, value] of Object.entries(dataset)) {
    if (value === "true") options[key] = true;
    else if (value === "false") options[key] = false;
    else options[key] = value;
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

/**
 * Create an element with pre-defined attributes. These can use the normal foundry "." notation.
 * @template {keyof HTMLElementTagNameMap} K
 * @param {K} tagName
 * @param {Partial<HTMLElementTagNameMap[K]> & object} attributes
 * @returns {HTMLElementTagNameMap[K]}
 */
export function createElement(tagName, attributes) {
  const element = document.createElement(tagName);
  for (const [k, v] of Object.entries(foundry.utils.flattenObject(attributes))) {
    if (k.includes(".")) foundry.utils.setProperty(element, k, v);
    else element[k] = v;
  }
  return element;
}
