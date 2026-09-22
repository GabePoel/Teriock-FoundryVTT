import { createElement } from "../../../helpers/html.mjs";

const { AbstractFormInputElement } = foundry.applications.elements;
const { Autocomplete } = foundry.applications.ux;

/**
 * @import { AutocompleteEntry } from "@client/applications/ux/_types.mjs";
 * @import { FormSelectOption } from "@client/applications/forms/fields.mjs";
 */

/**
 * @typedef AutocompleteSuggestionsInputConfig
 * @property {FormSelectOption[]} [options] - Suggestions to offer in an autocomplete menu.
 */

/**
 * Abstract form element whose primary input offers an Autocomplete menu of suggestions declared as `<option>`
 * children. The big idea is this allows for "choices"-like set of options without strictly requiring them.
 */
export default class AbstractAutocompleteSuggestionsElement extends AbstractFormInputElement {
  /**
   * Standardize text for matching.
   * @param {string} text
   * @returns {string}
   */
  static #normalize(text) {
    return text.trim().stripDiacritics().toLocaleLowerCase(game.i18n.lang);
  }

  /**
   * Append suggestion `<option>` children to an element.
   * @param {HTMLElement} element
   * @param {FormSelectOption[]} [options]
   */
  static _appendSuggestions(element, options = []) {
    for (const { label, value } of options) {
      element.append(createElement("option", { textContent: label, value }));
    }
  }

  /**
   * The Autocomplete menu.
   * @type {Autocomplete|null}
   */
  #autocomplete = null;

  /**
   * The current suggestions.
   * @type {(AutocompleteEntry & { search: string })[]}
   */
  #suggestions = [];

  /**
   * Dismiss Autocomplete menu when clicking outside input or menu.
   * @param {PointerEvent} event
   */
  #onClickAway(event) {
    if (event.target === this._primaryInput || this.#autocomplete.element?.contains(event.target)) { return; }
    this._dismissSuggestions();
  }

  /**
   * Keep focus on input while clicking inside Autocomplete menu.
   * @param {MouseEvent} event
   */
  #onMouseDownAway(event) {
    if (this.#autocomplete.element?.contains(event.target)) { event.preventDefault(); }
  }

  /**
   * Offer suggestions whose labels contain the current input text.
   */
  #refreshSuggestions() {
    if (!this.editable) { return this._dismissSuggestions(); }
    const query = AbstractAutocompleteSuggestionsElement.#normalize(this._primaryInput.value);
    const entries = this.#suggestions.filter(s => s.search.includes(query));
    if (entries.length) { this.#autocomplete.activate(this._primaryInput, entries); }
    else { this._dismissSuggestions(); }
  }

  /** @inheritDoc */
  _activateListeners() {
    if (!this.#suggestions.length) { return; }
    this.#autocomplete = new Autocomplete.implementation({ onSelect: this._onSelectSuggestion.bind(this) });
    const refresh = this.#refreshSuggestions.bind(this);
    this._primaryInput.addEventListener("click", refresh);
    this._primaryInput.addEventListener("focus", refresh);
    this._primaryInput.addEventListener("input", refresh);
    const body = this.ownerDocument.body;
    body.addEventListener("click", this.#onClickAway.bind(this), { signal: this.abortSignal });
    body.addEventListener("mousedown", this.#onMouseDownAway.bind(this), { signal: this.abortSignal });
  }

  /** @inheritDoc */
  _disconnect() {
    this._dismissSuggestions();
  }

  /**
   * Dismiss Autocomplete menu if this element is the one using it.
   */
  _dismissSuggestions() {
    if (this.#autocomplete && ui.autocomplete === this.#autocomplete) { this.#autocomplete.dismiss(); }
  }

  /**
   * Handle selection of a suggestion.
   * @param {string} value
   */
  _onSelectSuggestion(value) {
    this.value = value;
  }

  /** @inheritDoc */
  _toggleDisabled(disabled) {
    if (disabled) { this._dismissSuggestions(); }
  }

  /** @inheritDoc */
  connectedCallback() {
    // Read suggestions before base class replaces children.
    this.#suggestions = [...this.querySelectorAll("option")].map(o => ({
      identifier: o.value,
      label: o.textContent,
      search: AbstractAutocompleteSuggestionsElement.#normalize(o.textContent),
    }));
    super.connectedCallback();
  }
}
