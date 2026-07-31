import { StatDiceUpdater } from "../../dialogs/updaters/_module.mjs";

/**
 * @import { ApplicationConfiguration } from "@client/applications/_types.mjs";
 */

/**
 * @template {Constructor<TeriockDocumentSheet>} T
 * @param {T} Base
 */
export default function StatDiceSheetMixin(Base) {
  return (
    /**
     * @extends {TeriockDocumentSheet}
     * @mixin
     * @property {AnyCommonDocument} document
     */
    class StatDiceSheet extends Base {
      /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
      static DEFAULT_OPTIONS = { actions: { setStatDice: this._onSetStatDice } };

      /**
       * Modify a specified stat pool.
       * @param {PointerEvent} _event
       * @param {HTMLElement} target
       * @returns {Promise<void>}
       */
      static async _onSetStatDice(_event, target) {
        if (!this.isEditable) { return; }
        await StatDiceUpdater.create({ pool: this.document.system.statDice[target.dataset.stat] });
      }
    }
  );
}
