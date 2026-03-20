/**
 * @param {typeof TeriockDocumentSheet} Base
 */
export default (Base) => {
  return (
    /**
     * @extends {TeriockDocumentSheet}
     * @mixin
     * @property {CommonDocument} document
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
       * Open a linked document.
       * @param {PointerEvent} _event
       * @param {HTMLEmbedElement} target
       * @returns {Promise<void>}
       */
      static async _onOpenDoc(_event, target) {
        const uuid = target.dataset.uuid;
        const doc = await fromUuid(uuid);
        await doc.sheet.render(true);
      }

      /**
       * Rolls the current document with optional advantage/disadvantage.
       * @param {PointerEvent} event - The event object.
       * @returns {Promise<void>}
       */
      static async _onRollThis(event) {
        await this.document.use({
          event,
          showDialog: game.teriock.getSetting("showRollDialogs"),
        });
      }
    }
  );
};
