import { StatDiceUpdater } from "../../dialogs/updaters/_module.mjs";

/**
 * @import { ApplicationConfiguration } from "@client/applications/_types.mjs";
 */

/**
 * @template {MixinBase} T
 * @param {T} Base
 */
export default function StatDiceSheetMixin(Base) {
  /**
   * @mixin
   * @property {TeriockItem} document
   */
  class StatDiceSheet extends Base {
    /**
     * Modify a specified stat pool.
     * @param {PointerEvent} _event
     * @param {HTMLElement} target
     * @returns {Promise<void>}
     */
    static async #onUpdateStatDice(_event, target) {
      if (!game.teriock.checkEditable(this)) { return; }
      await StatDiceUpdater.create({ pool: this.document.system.statDice[target.dataset.stat] });
    }

    /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
    static DEFAULT_OPTIONS = { actions: { updateStatDice: this.#onUpdateStatDice } };
  }

  return StatDiceSheet;
}
