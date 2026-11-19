import ElderSorceryWordsTable from "../../data/models/elder-sorcery-words-table/elder-sorcery-words-table.mjs";
import { makeIconClass } from "../../utils/_module.mjs";
import { TeriockDialog } from "../api/_module.mjs";

const { AbstractFormInputElement } = foundry.applications.elements;
const { setInputAttributes } = foundry.applications.fields;
const { NumberField, StringField } = foundry.data.fields;

/**
 * @import { FormInputConfig } from "@common/data/_types.mjs";
 */

/**
 * Display and edit a table of elder sorcery words.
 * @extends {AbstractFormInputElement<object>}
 */
export default class HTMLElderSorceryWordsElement extends AbstractFormInputElement {
  /**
   * The element, OP, and part of speech of the last added word.
   * @type {object}
   */
  static #lastAdded = { op: 1 };

  /** @inheritDoc */
  static tagName = "elder-sorcery-words";

  /**
   * Create an HTMLElderSorceryWordsElement using provided configuration data.
   * @param {FormInputConfig<object>} config
   * @returns {HTMLElderSorceryWordsElement}
   */
  static create(config) {
    const el = document.createElement(this.tagName);
    setInputAttributes(el, config);
    el._setValue(config.value);
    el.setAttribute("value", JSON.stringify(el._value ?? {}));
    return el;
  }

  /**
   * The table this represents.
   * @returns {ElderSorceryWordsTable}
   */
  get #table() {
    return new ElderSorceryWordsTable(this._value);
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
      window: { icon: makeIconClass(TERIOCK.DISPLAY.icons.manifest.ui.add, "title"), title: `${prefix}.title` },
    });
    const word = data?.word?.trim();
    if (!word || !Number.isInteger(data.op)) { return; }
    HTMLElderSorceryWordsElement.#lastAdded = data;
    this.value = this.#table.addWord({ ...data, word }).toObject();
  }

  /** @inheritDoc */
  _buildElements() {
    this._value ??= JSON.parse(this.getAttribute("value") || "{}");
    return [];
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
      ElderSorceryWordsTable.copyWord(word);
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
    const { scrollLeft = 0, scrollTop = 0 } = this.querySelector(".teriock-words-table") ?? {};
    const context = { ...this.#table.getContext(), editable: this.editable };
    this.innerHTML = Handlebars.partials["teriock/ui/elder-sorcery-words-table"](context, {
      allowProtoMethodsByDefault: true,
      allowProtoPropertiesByDefault: true,
    });
    const scroller = this.querySelector(".teriock-words-table");
    scroller.dataset.scrollableId = this.name || this.constructor.tagName;
    Object.assign(scroller, { scrollLeft, scrollTop });
    if (this.editable) {
      this.insertAdjacentHTML(
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
