export default (Base) => {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends {DocumentSheetV2}
     * @property {TeriockCommon} document
     */
    class SelfInteractionCommonSheetPart extends Base {
      /** @type {Partial<ApplicationConfiguration>} */
      static DEFAULT_OPTIONS = {
        actions: {
          chatThis: this._chatThis,
          reloadThis: this._reloadThis,
          rollThis: this._rollThis,
        },
      };

      /**
       * Sends the current document to chat.
       * @param {PointerEvent} _event - The event object.
       * @param {HTMLElement} _target - The target element.
       * @returns {Promise<void>} Promise that resolves when chat is sent.
       */
      static async _chatThis(_event, _target) {
        await this.document.toMessage({
          actor: this.actor,
        });
      }

      /**
       * Reloads the current document and re-renders the sheet.
       * @param {PointerEvent} _event - The event object.
       * @param {HTMLElement} _target - The target element.
       * @returns {Promise<void>} Promise that resolves when reload is complete.
       */
      static async _reloadThis(_event, _target) {
        await this.document.update({});
        await this.document.sheet.render();
      }

      /**
       * Rolls the current document with optional advantage/disadvantage.
       * @param {PointerEvent} event - The event object.
       * @param {HTMLElement} _target - The target element.
       * @returns {Promise<void>} Promise that resolves when roll is complete.
       */
      static async _rollThis(event, _target) {
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
