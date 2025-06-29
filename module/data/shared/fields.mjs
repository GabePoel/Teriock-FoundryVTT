const { fields } = foundry.data;
import ModelCollection from "./model-collection.mjs";
import Pseudo from "../../documents/pseudo.mjs"

// Utility functions for common DOM operations
const createElement = (tag, className, styles = {}, content = "") => {
  const el = document.createElement(tag);
  if (className) el.className = className;
  Object.assign(el.style, styles);
  if (content) el.innerHTML = content;
  return el;
};

const createButton = (className, content, dataset = {}) => {
  const btn = createElement("button", className, {}, content);
  Object.assign(btn.dataset, dataset);
  return btn;
};

export class TeriockArrayField extends fields.ArrayField {
  _toInput(config) {
    const btn = createButton("teriock-array-field-add", '<i class="fa-solid fa-plus"></i> Add Item', {
      path: this.fieldPath,
    });
    if (config.name) btn.setAttribute("name", config.name);
    return btn;
  }
}

export class TeriockRecordField extends fields.TypedObjectField {
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

export class TeriockDynamicField extends fields.SchemaField {
  _toInput(config) {
    const out = super._toInput(config);
    out.classList.add("teriock-dynamic-field");
    return out;
  }
}
export function dynamicField(options = {}) {
  const rawOptions = {
    ...options,
    nullable: true,
  };
  const valueOptions = {
    ...options,
    initial: 0,
  };
  if (!options.initial) {
    rawOptions.initial = "0";
  }
  return new fields.SchemaField({
    raw: new fields.StringField(rawOptions),
    value: new fields.NumberField(valueOptions),
  });
}

/**
 * A collection that houses pseudo-documents.
 */
export class TeriockCollectionField extends fields.TypedObjectField {
  constructor(model, options = {}, context = {}) {
    let field = new fields.EmbeddedDataField(model);
    options.validateKey ||= ((key) => foundry.data.validators.isValidId(key));
    super(field, options, context);
    console.log("TeriockCollectionField", this.fieldPath);
  }

  /* -------------------------------------------------- */

  /** @inheritdoc */
  initialize(value, model, options = {}) {
    const init = super.initialize(value, model, options);
    const collection = new ModelCollection();
    for (const [id, model] of Object.entries(init)) {
      if (model instanceof Pseudo) {
        collection.set(id, model);
      } else {
        collection.setInvalid(model);
      }
    }
    return collection;
  }
}
