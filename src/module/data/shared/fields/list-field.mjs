const { ArrayField } = foundry.data.fields;
/**
 * Utility function for creating DOM elements with common properties.
 * Creates an element with specified tag, class, styles, and content.
 * @param {string} tag - The HTML tag name for the element.
 * @param {string} className - The CSS class name to apply to the element.
 * @param {object} styles - Object containing CSS styles to apply.
 * @param {string} content - The inner HTML content for the element.
 * @returns {HTMLElement} The created DOM element.
 * @private
 */
const createElement = (tag, className, styles = {}, content = "") => {
  const el = document.createElement(tag);
  if (className) {
    el.className = className;
  }
  Object.assign(el.style, styles);
  if (content) {
    el.innerHTML = content;
  }
  return el;
};
/**
 * Utility function for creating button elements with dataset attributes.
 * Creates a button with specified class, content, and data attributes.
 * @param {string} className - The CSS class name for the button.
 * @param {string} content - The inner HTML content for the button.
 * @param {object} dataset - Object containing data attributes to set.
 * @returns {HTMLButtonElement} The created button element.
 * @private
 */
const createButton = (className, content, dataset = {}) => {
  const btn = createElement("button", className, {}, content);
  Object.assign(btn.dataset, dataset);
  return btn;
};

/**
 * Custom array field for the Teriock system with enhanced input rendering.
 * Extends Foundry's ArrayField to provide custom input elements for array data.
 */
export default class ListField extends ArrayField {
  /** @inheritDoc */
  _toInput(config) {
    const btn = createButton(
      "teriock-array-field-add",
      '<i class="fa-solid fa-plus"></i> Add Item',
      {
        path: this.fieldPath,
      },
    );
    if (config.name) {
      btn.setAttribute("name", config.name);
    }
    return btn;
  }
}
