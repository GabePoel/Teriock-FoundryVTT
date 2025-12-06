const { TypedObjectField, StringField } = foundry.data.fields;

/**
 * A custom {@link TypedObjectField} that provides an easy form group for cases where the record's values have simple
 * form inputs.
 */
export default class RecordField extends TypedObjectField {
  /**
   * @inheritDoc
   * @param {FormInputConfig & {value: Record<string, any>, override?: string}} config
   */
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
          rootId: groupConfig.rootId,
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
