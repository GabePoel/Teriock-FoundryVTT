import { makeIconElement } from "../../helpers/icon.mjs";
import HTMLCycleButtonElement from "./cycle-button.mjs";

/**
 * A two-state toggle control that behaves like a checkbox, displaying an icon.
 * Clicking the button toggles between `true` and `false`. The button lights up when `true` and is otherwise `false`.
 * @extends {HTMLCycleButtonElement}
 */
export default class HTMLToggleButtonElement extends HTMLCycleButtonElement {
  /** @inheritDoc */
  static ORDER = [false, true];

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

  /** @type {boolean} */
  _value = false;

  /** @inheritDoc */
  _buildElements() {
    const elements = super._buildElements();
    const icon = this.getAttribute("icon");
    if (icon) { this._button.appendChild(makeIconElement(icon, "button")); }
    return elements;
  }

  /** @inheritDoc */
  _setValue(value) {
    this._value = value === true || value === "true";
  }
}
