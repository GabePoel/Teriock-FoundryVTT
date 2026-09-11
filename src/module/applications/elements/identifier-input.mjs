import { icons } from "../../constants/display/_module.mjs";
import { createElement } from "../../helpers/html.mjs";
import { makeIconClass } from "../../helpers/icon.mjs";

const { AbstractFormInputElement } = foundry.applications.elements;
const { setInputAttributes } = foundry.applications.fields;

/**
 * @import { FormInputConfig } from "@common/data/_types.mjs";
 */

/**
 * @typedef IdentifierInputConfig
 * @property {string|null} [reset] Identifier applied when the reset button is clicked.
 */

/**
 * A text input for plain identifiers with an optional reset button.
 * Used by {@link IdentifierField} when `reset` is configured.
 */
export default class HTMLIdentifierInputElement extends AbstractFormInputElement {
  /** @inheritDoc */
  static tagName = "identifier-input";

  /**
   * Create an HTMLIdentifierInputElement using provided configuration data.
   * @param {FormInputConfig<string> & IdentifierInputConfig} config
   * @returns {HTMLIdentifierInputElement}
   */
  static create(config) {
    const el = document.createElement(this.tagName);
    if (config.reset) { el.setAttribute("reset", config.reset); }
    if (config.value != null) { el.setAttribute("value", String(config.value)); }
    setInputAttributes(el, config);
    return el;
  }

  /**
   * The reset button element.
   * @type {HTMLButtonElement}
   */
  #resetButton;

  /**
   * Reset the identifier to the configured default value.
   */
  #onReset() {
    if (!this.reset || !this.editable) { return; }
    this._primaryInput.value = this.reset;
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

  /** @inheritDoc */
  _activateListeners() {
    this.#resetButton.addEventListener("click", this.#onReset.bind(this));
    this._primaryInput.addEventListener("change", event => {
      event.stopPropagation();
      this.dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));
    });
  }

  /** @inheritDoc */
  _buildElements() {
    this._primaryInput = createElement("input", { placeholder: this.getAttribute("placeholder"), type: "text" });
    this._applyInputAttributes(this._primaryInput);
    this.#resetButton = createElement("button", {
      ariaLabel: _loc("TERIOCK.ELEMENTS.IDENTIFIER_TAGS.reset"),
      className: `icon ${makeIconClass(icons.manifest.ui.reset, "button")}`,
      dataset: { tooltip: "TERIOCK.ELEMENTS.IDENTIFIER_TAGS.reset" },
      type: "button",
    });
    const group = createElement("div", { className: "input-group" });
    group.append(this._primaryInput, this.#resetButton);
    return [group];
  }

  /** @inheritDoc */
  _getValue() {
    return this._primaryInput?.value.trim() || null;
  }

  /** @inheritDoc */
  _refresh() {
    if (!this._primaryInput) { return; }
    const initial = this.getAttribute("value");
    if (initial != null) { this._primaryInput.value = initial; }
    this.removeAttribute("value");
  }

  /** @inheritDoc */
  _setValue(value) {
    if (this._primaryInput) { this._primaryInput.value = value ?? ""; }
  }

  /** @inheritDoc */
  _toggleDisabled(disabled) {
    this._primaryInput.disabled = disabled;
    this.#resetButton.disabled = disabled;
  }
}
