const { fields } = foundry.data;

/**
 * Utility function for creating DOM elements with common properties.
 * Creates an element with specified tag, class, styles, and content.
 *
 * @param {string} tag - The HTML tag name for the element.
 * @param {string} className - The CSS class name to apply to the element.
 * @param {object} styles - Object containing CSS styles to apply.
 * @param {string} content - The inner HTML content for the element.
 * @returns {HTMLElement} The created DOM element.
 * @private
 */
const createElement = (tag, className, styles = {}, content = "") => {
  const el = document.createElement(tag);
  if (className) el.className = className;
  Object.assign(el.style, styles);
  if (content) el.innerHTML = content;
  return el;
};

/**
 * Utility function for creating button elements with dataset attributes.
 * Creates a button with specified class, content, and data attributes.
 *
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
 * Custom array field for Teriock system with enhanced input rendering.
 * Extends Foundry's ArrayField to provide custom input elements for array data.
 */
export class TeriockArrayField extends fields.ArrayField {
  /**
   * Creates the input element for the array field.
   * Renders a button with plus icon for adding new items to the array.
   *
   * @param {object} config - Configuration object for the input element.
   * @returns {HTMLButtonElement} The rendered input button element.
   * @override
   * @private
   */
  _toInput(config) {
    const btn = createButton("teriock-array-field-add", '<i class="fa-solid fa-plus"></i> Add Item', {
      path: this.fieldPath,
    });
    if (config.name) btn.setAttribute("name", config.name);
    return btn;
  }
}

/**
 * Custom record field for Teriock system with multi-select and individual item inputs.
 * Extends Foundry's TypedObjectField to provide enhanced record editing capabilities.
 */
export class TeriockRecordField extends fields.TypedObjectField {
  /**
   * Creates the input element for the record field.
   * Renders a multi-select input for choosing which record items to display.
   *
   * @param {object} config - Configuration object for the input element.
   * @returns {HTMLElement} The rendered multi-select input element.
   * @override
   * @private
   */
  _toInput(config) {
    config.value = Object.keys(config.value ?? {});
    config.classes = "teriock-record-field";
    fields.StringField._prepareChoiceConfig(config);

    if (config.override) {
      config.name = config.override;
      config.dataset = { path: this.fieldPath };
    }

    const out = foundry.applications.fields.createMultiSelectInput(config);
    out.classList.add("teriock-update-input");
    return out;
  }

  /**
   * Creates a form group for the record field with individual item inputs.
   * Renders both the multi-select and individual form inputs for each record item.
   *
   * @param {object} groupConfig - Configuration for the form group.
   * @param {object} inputConfig - Configuration for the input elements.
   * @returns {HTMLElement} The rendered form group element.
   * @override
   */
  toFormGroup(groupConfig, inputConfig) {
    const out = super.toFormGroup(groupConfig, inputConfig);
    out.style.width = "100%";
    const items = document.createElement("div");
    items.classList.add("teriock-record-field-items", "form-group");
    for (const item of Object.keys(inputConfig.value ?? {})) {
      const itemInput = this.element.toFormGroup(
        {
          label: inputConfig.choices[item],
        },
        {
          name: `${this.fieldPath}.${item}`,
          value: inputConfig.value[item],
          classes: "teriock-update-input",
          disabled: inputConfig.disabled,
        },
      );
      itemInput.classList.add("teriock-record-field-item", "teriock-full-width");
      items.appendChild(itemInput);
    }
    out.appendChild(items);
    return out;
  }
}
