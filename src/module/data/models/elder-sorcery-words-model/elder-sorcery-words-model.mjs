import { makeIconClass, objectMap } from "../../../utils/_module.mjs";
import { BaseDataModel } from "../../abstract/_module.mjs";

const { fields } = foundry.data;

/**
 * A helper data model that stores and manipulates Elder Sorcery words.
 * @category Sorcery
 */
export default class ElderSorceryWordsModel extends BaseDataModel {
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
   * A table containing some entries.
   * @param {Iterable<Teriock.ElderSorcery.Entry>} entries
   * @returns {ElderSorceryWordsModel}
   */
  static fromEntries(entries) {
    const source = {};
    for (const { element, op, part, word } of entries) {
      (((source[element] ??= {})[part] ??= {})[op] ??= new Set()).add(word);
    }
    return new this(source);
  }

  /**
   * Merge several tables together.
   * @param {...ElderSorceryWordsModel} tables
   * @returns {ElderSorceryWordsModel}
   */
  static merge(...tables) {
    return this.fromEntries(tables.flatMap(t => Array.from(t.entries())));
  }

  /**
   * Whether this has no words.
   * @returns {boolean}
   */
  get isEmpty() {
    return this.entries().next().done;
  }

  /**
   * A table with a word added.
   * @param {Teriock.ElderSorcery.Entry} entry
   * @returns {ElderSorceryWordsModel}
   */
  addWord(entry) {
    return this.constructor.fromEntries([...this.entries(), { ...entry, op: Number(entry.op) }]);
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
   * @returns {ElderSorceryWordsModel}
   */
  filter({ elements, ops, parts } = {}) {
    const matcher = values => {
      if (values == null) { return () => true; }
      const keys = new Set(Array.from(typeof values === "object" ? values : [values], String));
      return key => keys.has(String(key));
    };
    const [matchElement, matchOp, matchPart] = [matcher(elements), matcher(ops), matcher(parts)];
    return this.constructor.fromEntries(
      Array.from(this.entries()).filter(e => matchElement(e.element) && matchPart(e.part) && matchOp(e.op)),
    );
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
   * @returns {{ columns: object[], groups: object[], icons: Record<string, string> }}
   */
  getContext() {
    const columns = [];
    for (const [element, { label: elementLabel }] of Object.entries(TERIOCK.CONFIG.metaphysics.elements)) {
      for (const [part, label] of Object.entries(TERIOCK.CONFIG.elderSorcery.partsOfSpeech)) {
        if (!Object.values(this[element]?.[part] ?? {}).some(w => w.size)) { continue; }
        columns.push({
          cssClass: `es-${element}`,
          element,
          label: _loc("TERIOCK.SHEETS.Table.HEADERS.words", { element: elementLabel, partOfSpeech: label }),
          part,
        });
      }
    }
    const ops = new Set(Array.from(this.entries(), e => e.op));
    const groups = Array.from(ops).sort((a, b) => a - b).map(op => {
      const cells = columns.map(c =>
        Array.from(this[c.element]?.[c.part]?.[op] ?? []).sort((a, b) => a.localeCompare(b, game.i18n.lang))
      );
      const length = Math.max(0, ...cells.map(c => c.length));
      return { op, rows: Array.fromRange(length).map(i => cells.map((c, j) => ({ ...columns[j], op, word: c[i] }))) };
    }).filter(g => g.rows.length);
    let rows = 0;
    for (const group of groups) {
      group.shifted = rows % 2 === 1;
      rows += group.rows.length;
    }
    const icons = {
      add: makeIconClass(TERIOCK.DISPLAY.icons.manifest.ui.add, "solid"),
      delete: makeIconClass(TERIOCK.DISPLAY.icons.manifest.ui.trash, "solid"),
    };
    return { columns, groups, icons };
  }

  /**
   * A table with a word removed.
   * @param {Teriock.ElderSorcery.Entry} entry
   * @returns {ElderSorceryWordsModel}
   */
  removeWord({ element, op, part, word }) {
    return this.constructor.fromEntries(
      Array.from(this.entries()).filter(e =>
        !(e.element === element && e.part === part && e.op === Number(op) && e.word === word)
      ),
    );
  }

  /**
   * Render this table as an HTML element.
   * @returns {Promise<HTMLElement>}
   */
  async renderElement() {
    return customElements.get("elder-sorcery-words").create({ readonly: true, value: this.toObject() });
  }

  /**
   * Render this table as HTML.
   * @returns {Promise<string>}
   */
  async renderHTML() {
    return (await this.renderElement()).outerHTML;
  }
}
