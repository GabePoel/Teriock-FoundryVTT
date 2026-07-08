import { icons } from "../../../constants/display/icons.mjs";
import { makeIconClass } from "../../../helpers/icon.mjs";
import BaseUpdater from "./base-updater.mjs";

/**
 * Dialog for updating a stat pool's formula and disabled state.
 * @property {AnyCommonDocument} document
 */
export default class StatDiceUpdater extends BaseUpdater {
  /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
  static DEFAULT_OPTIONS = { window: { icon: makeIconClass(icons.ui.dice, "title") } };

  /**
   * @inheritDoc
   * @param {Partial<ApplicationConfiguration & { pool: BaseStatPoolModel }>} options
   */
  constructor(options) {
    const pool = options.pool;
    super({ ...options, document: pool.document, paths: [`${pool.localPath}.formula`, `${pool.localPath}.disabled`] });
    this.#pool = pool;
  }

  /** @type {BaseStatPoolModel} */
  #pool;

  /** @inheritDoc */
  get _titlePrefix() {
    return this.#pool.dieName;
  }

  /** @inheritDoc */
  async _preparePartContext(partId, context, options) {
    context = await super._preparePartContext(partId, context, options);
    if (partId === "form") {
      const disabledPath = `${this.#pool.localPath}.disabled`;
      for (const field of context.fields) {
        if (field.name === disabledPath && !this.#pool.parent[`_canToggle${this.#pool.stat.capitalize()}Dice`]) {
          field.disabled = true;
          field.hint = _loc("TERIOCK.SYSTEMS.StatGiver.DIALOG.cantToggle");
        }
      }
    }
    return context;
  }
}
