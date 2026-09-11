import { createElement } from "../../helpers/html.mjs";

const { AbstractFormInputElement } = foundry.applications.elements;
const { Autocomplete } = foundry.applications.ux;

/**
 * A text input with an autocomplete menu of suggested options. But any value can be used.
 * Based off of {@link HTMLAutocompleteTagsElement}.
 */
export default class HTMLAutocompleteInputElement extends AbstractFormInputElement {
  /** @inheritDoc */
  static tagName = "autocomplete-input";

  /**
   * The autocomplete widget which offers matching options.
   * @type {Autocomplete}
   */
  #autocomplete;

  /**
   * The available options in their declared order, with labels normalized for prefix matching.
   * @type {(AutocompleteEntry & {search: string})[]}
   */
  #options = [];

  /** @inheritDoc */
  _buildElements() {
    this.#options = [...this.querySelectorAll("option")].map((o) => ({ identifier: o.value, label: o.textContent }));
    this._primaryInput = createElement("input", { type: "text", value: this.getAttribute("value") ?? "" });
    return [this._primaryInput];
  }

  /** @inheritDoc */
  _getValue() {
    return this._primaryInput.value.trim();
  }

  /** @inheritDoc */
  _setValue(value) {
    this._primaryInput.value = value ?? "";
  }

  /** @inheritDoc */
  _activateListeners() {
    this.#autocomplete = new Autocomplete.implementation({
      onSelect: (value) => {
        this.value = value;
      },
    });
    this._primaryInput.addEventListener("click", this.#refreshMenu.bind(this));
    this._primaryInput.addEventListener("focus", this.#refreshMenu.bind(this));
    this._primaryInput.addEventListener("input", this.#refreshMenu.bind(this));
    this.ownerDocument.body.addEventListener("click", this.#onClickAway.bind(this), { signal: this.abortSignal });
    this.ownerDocument.body.addEventListener("mousedown", this.#onMouseDownAway.bind(this), {
      signal: this.abortSignal,
    });
  }

  /**
   * Handle clicking away.
   * @param {PointerEvent} event
   */
  #onClickAway(event) {
    if (event.target === this._primaryInput || this.#autocomplete.element?.contains(event.target)) {
      return;
    }
    this.#dismissMenu();
  }

  /**
   * Handle mousedown away.
   * @param {MouseEvent} event
   */
  #onMouseDownAway(event) {
    if (this.#autocomplete.element?.contains(event.target)) {
      event.preventDefault();
    }
  }

  /** @inheritDoc */
  _disconnect() {
    this.#dismissMenu();
  }

  /** @inheritDoc */
  _toggleDisabled(disabled) {
    this._primaryInput.disabled = disabled;
    if (disabled) {
      this.#dismissMenu();
    }
  }

  /**
   * Dismiss the autocomplete menu if this element is the one currently using it.
   */
  #dismissMenu() {
    if (ui.autocomplete === this.#autocomplete) {
      this.#autocomplete.dismiss();
    }
  }

  /**
   * Standardize a label or a search query for prefix matching.
   * @param {string} text
   * @returns {string}
   */
  #normalize(text) {
    return text.trim().stripDiacritics().toLocaleLowerCase(game.i18n.lang);
  }

  /**
   * Offer the options whose labels begin with the current search text, omitting those which are already chosen or are
   * disabled. The full list is offered when no search text has been entered.
   */
  #refreshMenu() {
    if (!this.editable) {
      return this.#dismissMenu();
    }
    const prefix = this.#normalize(this._primaryInput.value);
    const entries = this.#options.filter((o) => this.#normalize(o.label).startsWith(prefix));
    this.#dismissMenu();
    if (entries.length) {
      this.#autocomplete.activate(this._primaryInput, entries);
    } else {
      this.#dismissMenu();
    }
  }

  /**
   * Create a HTMLAutocompleteInputElement using provided configuration data.
   * @param {FormInputConfig} config
   * @returns {HTMLAutocompleteInputElement}
   */
  static create(config) {
    const el = document.createElement(this.tagName);
    foundry.applications.fields.setInputAttributes(el, config);
    if (config.value) {
      el.setAttribute("value", config.value);
    }
    for (const { value, label } of config.options ?? []) {
      el.append(createElement("option", { value, textContent: label }));
    }
    return el;
  }
}
