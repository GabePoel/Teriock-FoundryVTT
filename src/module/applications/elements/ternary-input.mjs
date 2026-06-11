const { AbstractFormInputElement } = foundry.applications.elements;

/**
 * A three-state toggle control representing `true`, `false`, or `null`.
 * Left-click cycles forward (`null` -> `true` -> `false` -> `null`).
 * Right-click cycles backward (`null` -> `false` -> `true` -> `null`).
 * @extends {AbstractFormInputElement<boolean|null>}
 */
export default class HTMLTernaryElement extends AbstractFormInputElement {
  /** Cycle order for left-click. */
  static #ORDER = [null, true, false];

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

  /** @type {HTMLButtonElement} */
  #button;

  /** @type {boolean|null} */
  #value = null;

  /**
   * Step through the cycle in the given direction.
   * @param {-1|1} direction
   */
  #step(direction) {
    if (this.disabled) { return; }
    const order = HTMLTernaryElement.#ORDER;
    const idx = order.indexOf(this.#value);
    this.#value = order[(idx + order.length + direction) % order.length];
    this.#updateDisplay();
    this.dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));
  }

  #updateDisplay() {
    if (this.#button) { this.#button.value = String(this.#value); }
  }

  /** @inheritDoc */
  _activateListeners() {
    this.#button.addEventListener("click", () => this.#step(1));
    this.#button.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      this.#step(-1);
    });
    // Left-click on associated labels are forwarded by the browser.
    this.addEventListener("click", (event) => {
      if (!this.#button.contains(event.target)) { this.#step(1); }
    });
    // Right-click on associated labels are not forwarded by the browser, so we query the label directly.
    if (this.id) {
      this.ownerDocument?.querySelectorAll(`label[for="${this.id}"]`).forEach(label => {
        label.addEventListener("contextmenu", event => {
          event.preventDefault();
          this.#step(-1);
        });
      });
    }
  }

  /** @inheritDoc */
  _buildElements() {
    this.#button = this._primaryInput = document.createElement("button");
    this.#button.type = "button";
    this.#button.appendChild(document.createElement("div"));
    return [this.#button];
  }

  /** @inheritDoc */
  _getValue() {
    return this.#value;
  }

  /** @inheritDoc */
  _refresh() {
    const attr = this.getAttribute("value");
    if (attr !== null) {
      this._setValue(attr);
      this.removeAttribute("value");
    }
    this.#updateDisplay();
  }

  /** @inheritDoc */
  _setValue(value) {
    if (value === true || value === "true") { this.#value = true; }
    else if (value === false || value === "false") { this.#value = false; }
    else { this.#value = null; }
  }

  /** @inheritDoc */
  _toggleDisabled(disabled) {
    if (this.#button) { this.#button.disabled = disabled; }
  }
}
