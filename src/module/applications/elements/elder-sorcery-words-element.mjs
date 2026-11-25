import ElderSorceryWordsModel from "../../data/models/elder-sorcery-words-model/elder-sorcery-words-model.mjs";
import { makeIconClass } from "../../utils/_module.mjs";
import { TeriockDialog } from "../api/_module.mjs";

const { AbstractFormInputElement } = foundry.applications.elements;
const { setInputAttributes } = foundry.applications.fields;
const { SearchFilter } = foundry.applications.ux;
const { NumberField, StringField } = foundry.data.fields;

/**
 * @import { FormInputConfig } from "@common/data/_types.mjs";
 */

/**
 * Display and edit a table of elder sorcery words.
 * @extends {AbstractFormInputElement<object>}
 * @category Sorcery
 */
export default class HTMLElderSorceryWordsElement extends AbstractFormInputElement {
  /**
   * The element, OP, and part of speech of the last added word.
   * @type {object}
   */
  static #lastAdded = { op: 1 };

  /**
   * Search queries kept between renders.
   * @type {Map<string, string>}
   */
  static #queries = new Map();

  /** @inheritDoc */
  static tagName = "elder-sorcery-words";

  /**
   * Create an HTMLElderSorceryWordsElement using provided configuration data.
   * @param {FormInputConfig<object> & { searchKey?: string }} config
   * @returns {HTMLElderSorceryWordsElement}
   */
  static create(config) {
    const el = document.createElement(this.tagName);
    setInputAttributes(el, config);
    if (config.searchKey) { el.setAttribute("search-key", config.searchKey); }
    el._setValue(config.value);
    el.setAttribute("value", JSON.stringify(el._value ?? {}));
    return el;
  }

  /**
   * The table rendered as content.
   * @type {HTMLDivElement}
   */
  #content;

  /**
   * The search input.
   * @type {HTMLInputElement|null}
   */
  #search = null;

  /**
   * The table this represents.
   * @returns {ElderSorceryWordsModel}
   */
  get #table() {
    return new ElderSorceryWordsModel(this._value);
  }

  /**
   * Open a dialog for the user to add a new word.
   * @returns {Promise<void>}
   */
  async #addWord() {
    const prefix = "TERIOCK.SHEETS.Table.ADD";
    const fields = {
      element: new StringField({ blank: false, choices: TERIOCK.CONFIG.metaphysics.elements, required: true }),
      op: new NumberField({ integer: true, min: 0, nullable: false, required: true }),
      part: new StringField({ blank: false, choices: TERIOCK.CONFIG.elderSorcery.partsOfSpeech, required: true }),
      word: new StringField({ blank: false, required: true }),
    };
    const rootId = foundry.utils.randomID();
    const container = document.createElement("div");
    container.className = "teriock-form-container";
    for (const [name, field] of Object.entries(fields)) {
      container.append(
        field.toFormGroup({ label: `${prefix}.${name}`, localize: true, rootId }, {
          autofocus: name === "word",
          name,
          value: name === "word" ? "" : HTMLElderSorceryWordsElement.#lastAdded[name],
        }),
      );
    }
    const content = document.createElement("div");
    content.append(container);
    const data = await TeriockDialog.input({
      content,
      window: { icon: makeIconClass(TERIOCK.DISPLAY.icons.manifest.elderSorcery.addWord, "title"), title: `${prefix}.title` },
    });
    const word = data?.word?.trim();
    if (!word || !Number.isInteger(data.op)) { return; }
    HTMLElderSorceryWordsElement.#lastAdded = data;
    this.value = this.#table.addWord({ ...data, word }).toObject();
  }

  /** @inheritDoc */
  _activateListeners() {
    if (!this.#search) { return; }
    const key = this.getAttribute("search-key");
    new SearchFilter({
      initial: HTMLElderSorceryWordsElement.#queries.get(key) ?? "",
      inputSelector: ".teriock-block-search",
      callback: (_event, query) => {
        if (query === (HTMLElderSorceryWordsElement.#queries.get(key) ?? "")) { return; }
        HTMLElderSorceryWordsElement.#queries.set(key, query);
        this._refresh();
      },
    }).bind(this);
    const signal = this.abortSignal;
    this.#search.addEventListener("change", event => event.stopPropagation(), { signal });
    this.#search.addEventListener("keydown", event => {
      if (event.key === "Enter") { event.preventDefault(); }
    }, { signal });
  }

  /** @inheritDoc */
  _buildElements() {
    this._value ??= JSON.parse(this.getAttribute("value") || "{}");
    this.#content = document.createElement("div");
    this.#content.className = "teriock-words-content";
    const searchKey = this.getAttribute("search-key");
    if (!searchKey) { return [this.#content]; }
    this.#search = document.createElement("input");
    Object.assign(this.#search, {
      autocomplete: "off",
      className: "teriock-block-search",
      placeholder: _loc("TERIOCK.SHEETS.Common.SEARCH.placeholder"),
      type: "search",
    });
    this.#search.dataset.disable = "false";
    return [this.#search, this.#content];
  }

  /** @inheritDoc */
  _getValue() {
    return _replace(this._value);
  }

  /** @inheritDoc */
  _onClick(event) {
    const target = event.target.closest("[data-action]");
    if (!target || !this.contains(target)) { return; }
    const { action, word } = target.dataset;
    if (action === "copyWord") {
      event.stopPropagation();
      ElderSorceryWordsModel.copyWord(word);
    } else if (action === "addWord" && this.editable) {
      event.stopPropagation();
      this.#addWord();
    } else if (action === "deleteWord" && this.editable) {
      event.stopPropagation();
      this.value = this.#table.removeWord(target.dataset).toObject();
    }
  }

  /** @inheritDoc */
  _refresh() {
    if (!this.#content) { return; }
    const { scrollLeft = 0, scrollTop = 0 } = this.querySelector(".teriock-words-table") ?? {};
    const query = HTMLElderSorceryWordsElement.#queries.get(this.getAttribute("search-key"));
    const rgx = query ? new RegExp(RegExp.escape(query), "i") : null;
    const table = rgx
      ? ElderSorceryWordsModel.fromEntries(
        Array.from(this.#table.entries()).filter(e => SearchFilter.testQuery(rgx, e.word)),
      )
      : this.#table;
    const context = { ...table.getContext(), editable: this.editable };
    this.#content.innerHTML = Handlebars.partials["teriock/ui/elder-sorcery-words-table"](context, {
      allowProtoMethodsByDefault: true,
      allowProtoPropertiesByDefault: true,
    });
    const scroller = this.querySelector(".teriock-words-table");
    scroller.dataset.scrollableId = this.name || this.getAttribute("search-key") || this.constructor.tagName;
    Object.assign(scroller, { scrollLeft, scrollTop });
    if (this.editable) {
      this.#content.insertAdjacentHTML(
        "beforeend",
        `<div class="teriock-words-buttons"><button data-action="addWord" type="button"><i class="${context.icons.add}"></i>${
          _loc("TERIOCK.SHEETS.Table.ADD.title")
        }</button></div>`,
      );
    }
  }

  /** @inheritDoc */
  _setValue(value) {
    value = foundry.data.operators.DataFieldOperator.get(value);
    this._value = value instanceof foundry.abstract.DataModel ? value.toObject() : value;
  }
}
