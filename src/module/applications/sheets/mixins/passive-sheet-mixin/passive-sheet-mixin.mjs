import { pureUuid, safeUuid } from "../../../../helpers/resolve.mjs";

/**
 * Mixin for documents that passively modify other documents.
 * @param {typeof CommonSheet} Base
 */
export default function PassiveSheetMixin(Base) {
  return (
    /**
     * @extends {CommonSheet}
     * @mixes CommonSheet
     * @mixin
     * @property {TeriockAbility|TeriockProperty} document
     */
    class PassiveSheet extends Base {
      /** @type {Partial<ApplicationConfiguration>} */
      static DEFAULT_OPTIONS = {
        actions: {
          unlinkMacro: this._onUnlinkMacro,
          changeMacroRunHook: this._onChangeMacroRunHook,
        },
      };

      /**
       * Change the run pseudo-hook for a given macro
       * @param {Event} event - The event object.
       * @param {HTMLElement} target - The target element.
       * @returns {Promise<void>}
       * @private
       */
      static async _onChangeMacroRunHook(event, target) {
        event.stopPropagation();
        if (this.editable) {
          const uuidElement =
            /** @type {HTMLElement} */ target.closest("[data-uuid]");
          const uuid = uuidElement.dataset.uuid;
          await this.document.system.changeMacroRunHook(uuid);
        } else {
          ui.notifications.warn(
            "Sheet must be editable to change when a macro runs.",
          );
        }
      }

      /** @inheritDoc */
      static async _onUnlinkMacro(event, target) {
        event.stopPropagation();
        if (this.editable) {
          const uuidElement =
            /** @type {HTMLElement} */ target.closest("[data-uuid]");
          const uuid = uuidElement.dataset.uuid;
          await this.document.system.unlinkMacro(uuid);
        } else {
          ui.notifications.warn("Sheet must be editable to unlink macro.");
        }
      }

      /** @inheritDoc */
      async _onDropMacro(_event, data) {
        if (this._impactTab === "custom") {
          const updateData = {
            [`system.impacts.macros.${safeUuid(data?.uuid)}`]: "use",
          };
          await this.document.update(updateData);
        }
      }

      /** @inheritDoc */
      async _prepareMacroContext(context) {
        if (this._impactTab === "custom") {
          context.macros = [];
          for (const [safeUuid, pseudoHook] of Object.entries(
            this.document.system.impacts.macros,
          )) {
            const macro = await fromUuid(pureUuid(safeUuid));
            if (macro) {
              context.macros.push({
                safeUuid: safeUuid,
                macro: macro,
                pseudoHook: pseudoHook,
              });
            }
          }
        }
      }
    }
  );
}
