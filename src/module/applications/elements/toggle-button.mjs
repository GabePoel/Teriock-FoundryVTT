import { makeIconElement } from "../../helpers/icon.mjs";

const { AbstractFormInputElement } = foundry.applications.elements;

/**
 * A two-state toggle control that behaves like a checkbox, displaying an icon.
 * Clicking the button toggles between `true` and `false`. The button lights up when `true` and is otherwise `false`.
 * @extends {AbstractFormInputElement<boolean>}
 */
export default class HTMLToggleButtonElement extends AbstractFormInputElement {
  /** @inheritDoc */
  static tagName = "toggle-button";

  /**
   * Create an HTMLToggleButtonElement from a form input config.
   * @param {FormInputConfig<boolean> & { icon?: string }} config
   * @returns {HTMLToggleButtonElement}
   */
  static create(config) {
    const el = document.createElement(this.tagName);
    if (config.icon) { el.setAttribute("icon", config.icon); }
    if (config.value !== undefined) { el.setAttribute("value", String(Boolean(config.value))); }
    foundry.applications.fields.setInputAttributes(el, config);
    return el;
  }

  /** @type {HTMLButtonElement} */
  #button;

  /** @type {boolean} */
  #value = false;

  /** Flip the current value and notify listeners. */
  #toggle() {
    if (this.disabled) { return; }
    this.#value = !this.#value;
    this.#updateDisplay();
    this.dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));
  }

  #updateDisplay() {
    if (this.#button) { this.#button.value = String(this.#value); }
  }

  /** @inheritDoc */
  _activateListeners() {
    this.#button.addEventListener("click", () => this.#toggle());
    // Left-click on associated labels are forwarded by the browser.
    this.addEventListener("click", (event) => {
      if (!this.#button.contains(event.target)) { this.#toggle(); }
    });
  }

  /** @inheritDoc */
  _buildElements() {
    this.#button = this._primaryInput = document.createElement("button");
    this.#button.type = "button";
    const icon = this.getAttribute("icon");
    if (icon) { this.#button.appendChild(makeIconElement(icon, "button")); }
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
    this.#value = value === true || value === "true";
  }

  /** @inheritDoc */
  _toggleDisabled(disabled) {
    if (this.#button) { this.#button.disabled = disabled; }
  }
}
