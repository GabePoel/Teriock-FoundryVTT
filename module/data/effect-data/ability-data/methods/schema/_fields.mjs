const { fields } = foundry.data;

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

  toFormGroup(...args) {
    const out = super.toFormGroup(...args);
    out.style.width = "100%";
    return out;
  }
}
