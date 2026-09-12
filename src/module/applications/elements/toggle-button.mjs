import { createElement } from "../../helpers/html.mjs";
import { makeIconElement } from "../../helpers/icon.mjs";
import AbstractCycleButtonElement from "./abstract-cycle-button.mjs";

/**
 * @import { FormInputConfig } from "@common/data/_types.mjs";
 */

/**
 * A two-state toggle control that behaves like a checkbox but looks like a button. Clicking the button toggles between
 * `true` and `false`. Button is highlighted when `true` and is boring and lame when `false`.
 */
export default class HTMLToggleButtonElement extends AbstractCycleButtonElement {
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
    const el = createElement(this.tagName, { icon: config.icon, value: String(Boolean(config.value)) });
    foundry.applications.fields.setInputAttributes(el, config);
    return el;
  }

  /** @type {boolean} */
  _value = false;

  /** @inheritDoc */
  _buildElements() {
    const elements = super._buildElements();
    const icon = this.getAttribute("icon");
    if (icon) { this._primaryInput.appendChild(makeIconElement(icon, "button")); }
    return elements;
  }

  /** @inheritDoc */
  _setValue(value) {
    this._value = value === true || value === "true";
  }
}
