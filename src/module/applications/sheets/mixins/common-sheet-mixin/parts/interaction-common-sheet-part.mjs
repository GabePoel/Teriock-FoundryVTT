import { icons } from "../../../../../constants/display/icons.mjs";
import { makeIconClass } from "../../../../../helpers/utils.mjs";

/**
 * @param {typeof TeriockDocumentSheet} Base
 */
export default (Base) => {
  return (
    /**
     * @extends {TeriockDocumentSheet}
     * @mixin
     * @property {TeriockCommon} document
     */
    class InteractionCommonSheetPart extends Base {
      //noinspection JSValidateTypes
      /** @type {Partial<ApplicationConfiguration>} */
      static DEFAULT_OPTIONS = {
        actions: {
          chatThis: this._onChatThis,
          deleteThis: this._onDeleteThis,
          openDoc: this._onOpenDoc,
          rollThis: this._onRollThis,
        },
        window: {
          controls: [
            {
              action: "deleteThis",
              icon: makeIconClass(icons.ui.delete, "contextMenu"),
              label: "TERIOCK.SYSTEMS.Common.MENU.delete",
              ownership: "OWNER",
            },
          ],
        },
      };

      /**
       * Sends the current document to chat.
       * @returns {Promise<void>}
       */
      static async _onChatThis() {
        await this.document.toMessage({
          actor: this.actor,
        });
      }

      /**
       * Deletes the current document.
       * @returns {Promise<void>}
       */
      static async _onDeleteThis() {
        await this.document.safeDelete();
      }

      /**
       * Rolls the current document with optional advantage/disadvantage.
       * @param {PointerEvent} event - The event object.
       * @returns {Promise<void>}
       */
      static async _onRollThis(event) {
        await this.document.use({
          event,
          showDialog: game.settings.get("teriock", "showRollDialogs"),
        });
      }
    }
  );
};
