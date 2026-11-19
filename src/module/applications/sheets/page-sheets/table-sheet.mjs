import { ElderSorceryTable } from "../../../data/models/_module.mjs";
import { makeIconClass, mixClasses } from "../../../utils/_module.mjs";
import { BaseDocumentSheetMixin, TeriockDialog } from "../../api/_module.mjs";
import { SystemSettingsButtonSheetMixin } from "../mixins/_module.mjs";

const { NumberField, StringField } = foundry.data.fields;
const { JournalEntryPageHandlebarsSheet } = foundry.applications.sheets.journal;

/**
 * @extends {JournalEntryPageHandlebarsSheet}
 * @property {TeriockJournalEntryPage<"table">} document
 */
export default class TableSheet
  extends mixClasses(JournalEntryPageHandlebarsSheet, BaseDocumentSheetMixin, SystemSettingsButtonSheetMixin)
{
  /**
   * Add a word to the table.
   * @this {TableSheet}
   */
  static async #onAddWord() {
    if (!game.teriock.checkEditable(this)) { return; }
    const prefix = "TERIOCK.SHEETS.Table.ADD";
    const fields = {
      element: new StringField({ blank: false, choices: TERIOCK.CONFIG.metaphysics.elements, required: true }),
      op: new NumberField({ integer: true, min: 0, nullable: false, required: true }),
      partOfSpeech: new StringField({
        blank: false,
        choices: TERIOCK.CONFIG.elderSorcery.partsOfSpeech,
        required: true,
      }),
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
          value: name === "word" ? "" : this.#lastAdded[name],
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
    this.#lastAdded = data;
    const path = `system.table.${data.element}.${data.partOfSpeech}.${data.op}`;
    const current = foundry.utils.getProperty(this.document._source, path) ?? [];
    await this.document.update({ [path]: [...new Set([...current, word])] });
  }

  /**
   * Copy a word to the clipboard.
   * @param {PointerEvent} _event
   * @param {HTMLElement} target
   */
  static async #onCopyWord(_event, target) {
    await ElderSorceryTable.copyWord(target.dataset.word);
  }

  /**
   * Delete a word from the table.
   * @param {PointerEvent} _event
   * @param {HTMLElement} target
   * @this {TableSheet}
   */
  static async #onDeleteWord(_event, target) {
    if (!game.teriock.checkEditable(this)) { return; }
    const { element, op, partOfSpeech, word } = target.dataset;
    const path = `system.table.${element}.${partOfSpeech}.${op}`;
    const remaining = (foundry.utils.getProperty(this.document._source, path) ?? []).filter(w => w !== word);
    await this.document.update({ [path]: remaining.length ? remaining : _del });
  }

  /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
  static DEFAULT_OPTIONS = {
    actions: { addWord: this.#onAddWord, copyWord: this.#onCopyWord, deleteWord: this.#onDeleteWord },
    window: { icon: makeIconClass(TERIOCK.DISPLAY.icons.manifest.document.sorcery, "title") },
  };

  /** @type {Record<string, HandlebarsTemplatePart>} */
  static EDIT_PARTS = {
    header: super.EDIT_PARTS.header,
    content: { scrollable: [".teriock-words-table"], template: "teriock/sheets/pages/table-edit" },
    footer: super.EDIT_PARTS.footer,
  };

  /** @type {Record<string, HandlebarsTemplatePart>} */
  static VIEW_PARTS = { content: { root: true, template: "teriock/sheets/pages/table-view" } };

  /**
   * The element, OP, and part of speech of the last added word.
   * @type {object}
   */
  #lastAdded = { op: 1 };

  /** @inheritDoc */
  async _prepareContext(options = {}) {
    const context = await super._prepareContext(options);
    context.icons = {
      add: makeIconClass(TERIOCK.DISPLAY.icons.manifest.ui.add, "solid"),
      delete: makeIconClass(TERIOCK.DISPLAY.icons.manifest.ui.trash, "solid"),
    };
    return Object.assign(context, this.document.system.table.getContext());
  }
}
