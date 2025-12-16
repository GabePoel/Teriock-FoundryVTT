/**
 * @param {typeof DocumentSheetV2} Base
 */
export default (Base) => {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends {DocumentSheetV2}
     * @mixin
     * @property {TeriockCommon} document
     */
    class InteractionCommonSheetPart extends Base {
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
       * @returns {Promise<void>} Promise that resolves when chat is sent.
       */
      static async _onChatThis() {
        await this.document.toMessage({
          actor: this.actor,
        });
      }

      /**
       * Rolls the current document with optional advantage/disadvantage.
       * @param {PointerEvent} event - The event object.
       * @returns {Promise<void>} Promise that resolves when roll is complete.
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
