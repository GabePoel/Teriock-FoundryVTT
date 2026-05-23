import { icons } from "../../constants/display/icons.mjs";
import { createElement } from "../../helpers/html.mjs";
import { makeIconClass } from "../../helpers/utils.mjs";

const { AbstractFormInputElement } = foundry.applications.elements;
const { setInputAttributes } = foundry.applications.fields;

/**
 * @import {FormInputConfig} from "@common/data/_types.mjs";
 */

/**
 * @typedef IdentifierInputConfig
 * @property {string|null} [reset] Identifier applied when the reset button is clicked.
 */

/**
 * A text input for plain identifiers with an optional reset button.
 * Used by {@link IdentifierField} when `reset` is configured.
 * @extends {AbstractFormInputElement<string|null>}
 */
export default class HTMLIdentifierInputElement extends AbstractFormInputElement {
  /** @override */
  static tagName = "identifier-input";

  /**
   * Create an HTMLIdentifierInputElement using provided configuration data.
   * @param {FormInputConfig<string> & IdentifierInputConfig} config
   * @returns {HTMLIdentifierInputElement}
   */
  static create(config) {
    const el = document.createElement(this.tagName);
    if (config.reset) el.setAttribute("reset", config.reset);
    if (config.value != null) el.setAttribute("value", String(config.value));
    setInputAttributes(el, config);
    return el;
  }

  /**
   * The text input element.
   * @type {HTMLInputElement}
   */
  #input;

  /**
   * The reset button element.
   * @type {HTMLButtonElement}
   */
  #resetButton;

  /**
   * Reset the identifier to the configured default value.
   */
  #onReset() {
    if (!this.reset || !this.editable) return;
    this.#input.value = this.reset;
    this.dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));
    this.dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));
  }

  /**
   * The identifier applied when the reset button is clicked.
   * @return {string|null}
   */
  get reset() {
    return this.getAttribute("reset");
  }

  /** @override */
  _activateListeners() {
    this.#resetButton.addEventListener("click", this.#onReset.bind(this));
    this.#input.addEventListener("change", event => {
      event.stopPropagation();
      this.dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));
    });
  }

  /** @override */
  _buildElements() {
    this.#input = this._primaryInput = createElement("input", {
      placeholder: this.getAttribute("placeholder"),
      type: "text",
    });
    this._applyInputAttributes(this.#input);
    this.#resetButton = createElement("button", {
      ariaLabel: _loc("TERIOCK.ELEMENTS.IDENTIFIER_TAGS.reset"),
      className: "icon " + makeIconClass(icons.ui.reset, "button"),
      dataset: { tooltip: "TERIOCK.ELEMENTS.IDENTIFIER_TAGS.reset" },
      type: "button",
    });
    return [this.#input, this.#resetButton];
  }

  /** @override */
  _getValue() {
    const value = this.#input?.value.trim();
    return value || null;
  }

  /** @override */
  _refresh() {
    if (!this.#input) return;
    const initial = this.getAttribute("value");
    if (initial != null) this.#input.value = initial;
    this.removeAttribute("value");
  }

  /** @override */
  _setValue(value) {
    if (this.#input) this.#input.value = value ?? "";
  }

  /** @override */
  _toggleDisabled(disabled) {
    this.#input.disabled = disabled;
    this.#resetButton.disabled = disabled;
  }
}
