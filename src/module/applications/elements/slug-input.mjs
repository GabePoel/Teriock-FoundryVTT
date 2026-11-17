import { createElement, makeIconClass, toSlug } from "../../utils/_module.mjs";
import { AbstractAutocompleteSuggestionsElement } from "./abstract/_module.mjs";

const { setInputAttributes } = foundry.applications.fields;

/**
 * @import { FormInputConfig } from "@common/data/_types.mjs";
 * @import { AutocompleteSuggestionsInputConfig } from "./abstract/abstract-autocomplete-suggestions.mjs";
 */

/**
 * @typedef SlugInputConfig
 * @property {string|null} [generate] Slug applied when the generate button is clicked.
 */

/**
 * A text input for slugs with an optional generate button.
 * @category Identifiers
 */
export default class HTMLSlugInputElement extends AbstractAutocompleteSuggestionsElement {
  /** @inheritDoc */
  static tagName = "slug-input";

  /**
   * Create an HTMLSlugInputElement using provided configuration data.
   * @param {FormInputConfig<string> & SlugInputConfig & AutocompleteSuggestionsInputConfig} config
   * @returns {HTMLSlugInputElement}
   */
  static create(config) {
    const el = document.createElement(this.tagName);
    if (config.generate) { el.setAttribute("generate", config.generate); }
    if (config.value != null) { el.setAttribute("value", String(config.value)); }
    setInputAttributes(el, config);
    this._appendSuggestions(el, config.options);
    return el;
  }

  /**
   * The generate button element.
   * @type {HTMLButtonElement|null}
   */
  #generateButton = null;

  /**
   * Apply the generated slug.
   */
  #onGenerate() {
    if (!this.generate || !this.editable) { return; }
    this._primaryInput.value = this.generate;
    this.dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));
    this.dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));
  }

  /**
   * Label the current identifier with its suggestion's name.
   */
  #refreshTag() {
    if (!this._tags) { return; }
    const value = this._getValue();
    const label = this._getSuggestionLabel(value);
    this._tags.replaceChildren(...label ? [this.constructor.renderTag(value, label, false)] : []);
  }

  /**
   * The slug applied when the generate button is clicked.
   * @returns {Slug|null}
   */
  get generate() {
    return this.getAttribute("generate");
  }

  /** @inheritDoc */
  _activateListeners() {
    super._activateListeners();
    this.#generateButton?.addEventListener("click", this.#onGenerate.bind(this));
    this._primaryInput.addEventListener("change", event => {
      event.stopPropagation();
      this._primaryInput.value = toSlug(this._primaryInput.value);
      this.dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));
    });
    this.addEventListener("change", this.#refreshTag.bind(this), { signal: this.abortSignal });
  }

  /** @inheritDoc */
  _buildElements() {
    const [tags, group] = super._buildElements();
    this._applyInputAttributes(this._primaryInput);
    if (this.generate) {
      this.#generateButton = createElement("button", {
        ariaLabel: _loc("TERIOCK.ELEMENTS.SLUG_INPUT.generate"),
        className: `icon ${makeIconClass(TERIOCK.DISPLAY.icons.manifest.ui.generate, "button")}`,
        dataset: { tooltip: "TERIOCK.ELEMENTS.SLUG_INPUT.generate" },
        type: "button",
      });
      group.append(this.#generateButton);
    }
    return [tags, group];
  }

  /** @inheritDoc */
  _formatInput(value) {
    return toSlug(value, { partial: true });
  }

  /** @inheritDoc */
  _getValue() {
    return toSlug(this._primaryInput?.value ?? "") || null;
  }

  /** @inheritDoc */
  _refresh() {
    if (!this._primaryInput) { return; }
    const initial = this.getAttribute("value");
    if (initial != null) { this._primaryInput.value = initial; }
    this.removeAttribute("value");
    this.#refreshTag();
  }

  /** @inheritDoc */
  _setValue(value) {
    if (this._primaryInput) { this._primaryInput.value = value ?? ""; }
    this.#refreshTag();
  }
}
