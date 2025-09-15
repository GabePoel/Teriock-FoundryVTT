import { pureUuid } from "../../../helpers/utils.mjs";

/**
 * Mixin for documents that passively modify other documents.
 * @param {DocumentSheetV2} Base
 */
export default (Base) => {
  return (/**
   * @extends {TeriockBaseEffectSheet}
   */
  class PassiveSheetMixin extends Base {
    /** @inheritDoc */
    static DEFAULT_OPTIONS = {
      actions: {
        unlinkMacro: this._unlinkMacro,
        changeMacroRunHook: this._changeMacroRunHook,
      },
    };

    /** @inheritDoc */
    static async _unlinkMacro(_event, target) {
      if (this.editable) {
        const uuid = target.dataset.parentId;
        await this.document.system.unlinkMacro(uuid);
      } else {
        foundry.ui.notifications.warn("Sheet must be editable to unlink macro.");
      }
    }

    /**
     * Change the run pseudo-hook for a given macro
     * @param {Event} _event - The event object.
     * @param {HTMLElement} target - The target element.
     * @returns {Promise<void>}
     * @private
     */
    static async _changeMacroRunHook(_event, target) {
      if (this.editable) {
        const uuid = target.dataset.parentId;
        await this.document.system.changeMacroRunHook(uuid);
      } else {
        foundry.ui.notifications.warn("Sheet must be editable to change when a macro runs.");
      }
    }

    /** @inheritDoc */
    async _prepareMacroContext(context) {
      context.macros = [];
      for (const [ safeUuid, pseudoHook ] of Object.entries(this.document.system.applies.macros)) {
        const macro = await foundry.utils.fromUuid(pureUuid(safeUuid));
        if (macro) {
          context.macros.push({
            safeUuid: safeUuid,
            macro: macro,
            pseudoHook: pseudoHook,
          });
        }
      }
    }
  });
}