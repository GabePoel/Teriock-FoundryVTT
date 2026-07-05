import HTMLCycleButtonElement from "./cycle-button.mjs";

/**
 * A three-state toggle control representing `true`, `false`, or `null`.
 * Left-click cycles forward (`null` -> `true` -> `false` -> `null`).
 * Right-click cycles backward (`null` -> `false` -> `true` -> `null`).
 * @extends {HTMLCycleButtonElement}
 */
export default class HTMLTernaryElement extends HTMLCycleButtonElement {
  /** @inheritDoc */
  static ORDER = [null, true, false];

  /** @inheritDoc */
  static tagName = "ternary-input";

  /**
   * Create an HTMLTernaryElement from a form input config.
   * @param {FormInputConfig<boolean|null>} config
   * @returns {HTMLTernaryElement}
   */
  static create(config) {
    const el = document.createElement(this.tagName);
    if (config.value !== undefined && config.value !== null) {
      el.setAttribute("value", String(config.value));
    }
    foundry.applications.fields.setInputAttributes(el, config);
    return el;
  }

  /** @type {boolean|null} */
  _value = null;

  /** @inheritDoc */
  _activateListeners() {
    super._activateListeners();
    this._button.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      this._step(-1);
    });
    // Right-click on associated labels are not forwarded by the browser, so we query the label directly.
    if (this.id) {
      this.ownerDocument?.querySelectorAll(`label[for="${this.id}"]`).forEach(label => {
        label.addEventListener("contextmenu", event => {
          event.preventDefault();
          this._step(-1);
        });
      });
    }
  }

  /** @inheritDoc */
  _buildElements() {
    const elements = super._buildElements();
    this._button.appendChild(document.createElement("div"));
    return elements;
  }

  /** @inheritDoc */
  _setValue(value) {
    if (value === true || value === "true") { this._value = true; }
    else if (value === false || value === "false") { this._value = false; }
    else { this._value = null; }
  }
}
