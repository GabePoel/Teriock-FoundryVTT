import { TeriockTextEditor } from "../../../applications/ux/_module.mjs";
import { objectMap } from "../../../utils/_module.mjs";
import { BaseDataModel } from "../../abstract/_module.mjs";

const { fields } = foundry.data;

/**
 * The master class for handling Elder Sorcery words.
 */
export default class ElderSorceryTable extends BaseDataModel {
  /**
   * Activate listeners on a rendered table.
   * @param {HTMLElement} element
   */
  static activateListeners(element) {
    element.addEventListener("click", event => {
      const word = event.target.closest("[data-action='copyWord']")?.dataset.word;
      if (word) { this.copyWord(word); }
    });
  }

  /**
   * Copy a word to the clipboard.
   * @param {string} text
   * @returns {Promise<void>}
   */
  static async copyWord(text) {
    await game.clipboard.copyPlainText(text);
    ui.notifications.info("TERIOCK.SHEETS.Common.NOTIFICATIONS.copiedToClipboard", { format: { text } });
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(
      super.defineSchema(),
      objectMap(TERIOCK.CONFIG.metaphysics.elements, () =>
        new fields.TypedObjectField(
          new fields.TypedObjectField(new fields.SetField(new fields.StringField({ blank: false })), {
            validateKey: k => /^\d+$/.test(k),
          }),
          { validateKey: k => k in TERIOCK.CONFIG.elderSorcery.partsOfSpeech },
        )),
    );
  }

  /**
   * Merge several tables together.
   * @param {...ElderSorceryTable} tables
   * @returns {ElderSorceryTable}
   */
  static merge(...tables) {
    const source = {};
    for (const table of tables) {
      for (const { element, op, part, word } of table.entries()) {
        (((source[element] ??= {})[part] ??= {})[op] ??= new Set()).add(word);
      }
    }
    return new this(source);
  }

  /**
   * Whether this has no words.
   * @returns {boolean}
   */
  get isEmpty() {
    return this.entries().next().done;
  }

  /**
   * Every word in this table.
   * @returns {Generator<Teriock.ElderSorcery.Entry>}
   */
  *entries() {
    for (const element of Object.keys(TERIOCK.CONFIG.metaphysics.elements)) {
      for (const [part, byOp] of Object.entries(this[element])) {
        for (const [op, list] of Object.entries(byOp)) {
          for (const word of list) { yield { element, op: Number(op), part, word }; }
        }
      }
    }
  }

  /**
   * A table with only the words matching a filter.
   * @param {Teriock.ElderSorcery.Filter} [filter]
   * @returns {ElderSorceryTable}
   */
  filter({ elements, ops, parts } = {}) {
    const matcher = values => {
      if (values == null) { return () => true; }
      const keys = new Set(Array.from(typeof values === "object" ? values : [values], String));
      return key => keys.has(String(key));
    };
    const [matchElement, matchOp, matchPart] = [matcher(elements), matcher(ops), matcher(parts)];
    const source = {};
    for (const { element, op, part, word } of this.entries()) {
      if (matchElement(element) && matchPart(part) && matchOp(op)) {
        (((source[element] ??= {})[part] ??= {})[op] ??= new Set()).add(word);
      }
    }
    return new this.constructor(source);
  }

  /**
   * Every entry for a word.
   * @param {string} word
   * @returns {Teriock.ElderSorcery.Entry[]}
   */
  find(word) {
    return Array.from(this.entries()).filter(e => e.word === word);
  }

  /**
   * Columns and OP row groups for rendering this table.
   * @returns {{ columns: object[], groups: object[] }}
   */
  getContext() {
    const columns = [];
    for (const [element, { label: elementLabel }] of Object.entries(TERIOCK.CONFIG.metaphysics.elements)) {
      for (const [partOfSpeech, label] of Object.entries(TERIOCK.CONFIG.elderSorcery.partsOfSpeech)) {
        if (!Object.values(this[element]?.[partOfSpeech] ?? {}).some(w => w.size)) { continue; }
        columns.push({
          cssClass: `es-${element}`,
          element,
          label: _loc("TERIOCK.SHEETS.Table.HEADERS.words", { element: elementLabel, partOfSpeech: label }),
          partOfSpeech,
        });
      }
    }
    const ops = new Set(Array.from(this.entries(), e => e.op));
    const groups = Array.from(ops).sort((a, b) => a - b).map(op => {
      const cells = columns.map(c =>
        Array.from(this[c.element]?.[c.partOfSpeech]?.[op] ?? []).sort((a, b) => a.localeCompare(b, game.i18n.lang))
      );
      const length = Math.max(0, ...cells.map(c => c.length));
      return { op, rows: Array.fromRange(length).map(i => cells.map((c, j) => ({ ...columns[j], op, word: c[i] }))) };
    }).filter(g => g.rows.length);
    let rows = 0;
    for (const group of groups) {
      group.shifted = rows % 2 === 1;
      rows += group.rows.length;
    }
    return { columns, groups };
  }

  /**
   * Render this table as an HTML element.
   * @returns {Promise<HTMLElement>}
   */
  async renderElement() {
    return foundry.utils.parseHTML(await this.renderHTML());
  }

  /**
   * Render this table as HTML.
   * @returns {Promise<string>}
   */
  async renderHTML() {
    return TeriockTextEditor.renderTemplate("teriock/sheets/pages/words-table", this.getContext());
  }
}
