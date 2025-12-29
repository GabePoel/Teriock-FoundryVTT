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
          rollThis: this._onRollThis,
          openDoc: this._onOpenDoc,
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
       * Rolls the current document with optional advantage/disadvantage.
       * @param {PointerEvent} event - The event object.
       * @returns {Promise<void>}
       */
      static async _onRollThis(event) {
        const options = event?.altKey
          ? { advantage: true }
          : event?.shiftKey
            ? { disadvantage: true }
            : {};
        await this.document.use(options);
      }
    }
  );
};
