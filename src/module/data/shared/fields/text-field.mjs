const { HTMLField } = foundry.data.fields;

export default class TextField extends HTMLField {
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
    const label = out.querySelector("label") || /** @type {any} */
      (out.firstElementChild);
    const labelContainer = document.createElement("div");
    labelContainer.classList.add("ab-section");
    label.classList.add("ab-section-title");
    out.replaceChild(labelContainer, label);
    labelContainer.appendChild(label);
    return out;
  }
}
