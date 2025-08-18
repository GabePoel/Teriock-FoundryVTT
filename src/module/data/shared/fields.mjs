import { TeriockRoll } from "../../documents/_module.mjs";

const { StringField, ArrayField, TypedObjectField, HTMLField } =
  foundry.data.fields;

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
 * Custom array field for the Teriock system with enhanced input rendering.
 * Extends Foundry's ArrayField to provide custom input elements for array data.
 */
export class TeriockArrayField extends ArrayField {
  /** @inheritDoc */
  _toInput(config) {
    const btn = createButton(
      "teriock-array-field-add",
      '<i class="fa-solid fa-plus"></i> Add Item',
      {
        path: this.fieldPath,
      },
    );
    if (config.name) btn.setAttribute("name", config.name);
    return btn;
  }
}

/**
 * Custom record field for Teriock system with multi-select and individual item inputs.
 * Extends Foundry's TypedObjectField to provide enhanced record editing capabilities.
 */
export class TeriockRecordField extends TypedObjectField {
  /** @inheritDoc */
  _toInput(config) {
    config.value = Object.keys(config.value ?? {});
    config.classes = "teriock-record-field";
    StringField._prepareChoiceConfig(config);

    if (config.override) {
      config.name = config.override;
      config.dataset = { path: this.fieldPath };
    }

    const out = foundry.applications.fields.createMultiSelectInput(config);
    out.classList.add("teriock-update-input");
    return out;
  }

  /** @inheritDoc */
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
      itemInput.classList.add(
        "teriock-record-field-item",
        "teriock-full-width",
      );
      items.appendChild(itemInput);
    }
    out.appendChild(items);
    return out;
  }
}

/**
 * Special case {@link StringField} which represents a formula.
 *
 * @param {StringFieldOptions & { deterministic?: boolean; }} [options={}] - Options which configure field behavior.
 * @property {boolean} deterministic=false - Is this formula not allowed to have dice values?
 */
export class FormulaField extends StringField {
  /** @inheritdoc */
  static get _defaults() {
    return foundry.utils.mergeObject(super._defaults, {
      required: true,
      deterministic: false,
    });
  }

  /** @override */
  _applyChangeAdd(value, delta, model, change) {
    if (!value) return delta;
    const operator = delta.startsWith("-") ? "-" : "+";
    delta = delta.replace(/^[+-]/, "").trim();
    return `${value} ${operator} ${delta}`;
  }

  /** @override */
  _applyChangeDowngrade(value, delta, model, change) {
    if (!value) return delta;
    const terms = new TeriockRoll(value, {}).terms;
    if (terms.length === 1 && terms[0]?.fn === "min")
      return value.replace(/\)$/, `, ${delta})`);
    return `min(${value}, ${delta})`;
  }

  /** @override */
  _applyChangeMultiply(value, delta, model, change) {
    if (!value) return delta;
    const terms = new TeriockRoll(value, {}).terms;
    if (terms.length > 1) return `(${value}) * ${delta}`;
    return `${value} * ${delta}`;
  }

  /** @override */
  _applyChangeUpgrade(value, delta, model, change) {
    if (!value) return delta;
    const terms = new TeriockRoll(value, {}).terms;
    if (terms.length === 1 && terms[0]?.fn === "max")
      return value.replace(/\)$/, `, ${delta})`);
    return `max(${value}, ${delta})`;
  }

  /** @override */
  _castChangeDelta(delta) {
    return this._cast(delta).trim();
  }

  /** @inheritdoc */
  _validateType(value) {
    if (this.deterministic) {
      const roll = new TeriockRoll(value, {});
      if (!roll.isDeterministic) throw new Error("must not contain dice terms");
    }
    super._validateType(value);
  }
}

export class TextField extends HTMLField {
  /** @inheritDoc */
  _toInput(config) {
    config.toggled = true;
    const innerContent = document.createElement("div");
    innerContent.classList.add("text-preview");
    if (config.enriched) {
      innerContent.innerHTML = config.enriched;
      delete config.enriched;
    } else {
      innerContent.innerHTML = config.value;
    }
    /** @type {HTMLDivElement} */
    const out = super._toInput(config);
    out.append(innerContent);
    return out;
  }

  /** @inheritDoc */
  toFormGroup(groupConfig, inputConfig) {
    /** @type {HTMLDivElement} */
    const out = super.toFormGroup(groupConfig, inputConfig);
    out.classList.add("ab-section-container");
    out.classList.remove("form-group");
    /** @type {HTMLLabelElement|null} */
    const label =
      out.querySelector("label") || /** @type {any} */ (out.firstElementChild);
    const labelContainer = document.createElement("div");
    labelContainer.classList.add("ab-section");
    label.classList.add("ab-section-title");
    out.replaceChild(labelContainer, label);
    labelContainer.appendChild(label);
    return out;
  }
}
