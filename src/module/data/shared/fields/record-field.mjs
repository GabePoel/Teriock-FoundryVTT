const {
  TypedObjectField,
  StringField,
} = foundry.data.fields;

/**
 * Custom record field for the Teriock system with multi-select and individual item inputs.
 * Extends Foundry's TypedObjectField to provide enhanced record editing capabilities.
 */
export default class RecordField extends TypedObjectField {
  /** @inheritDoc */
  _toInput(config) {
    // noinspection JSValidateTypes
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
      const itemInput = this.element.toFormGroup({
        label: inputConfig.choices[item],
      }, {
        name: `${this.fieldPath}.${item}`,
        value: inputConfig.value[item],
        classes: "teriock-update-input",
        disabled: inputConfig.disabled,
      });
      itemInput.classList.add("teriock-record-field-item", "teriock-full-width");
      items.appendChild(itemInput);
    }
    out.appendChild(items);
    return out;
  }
}
