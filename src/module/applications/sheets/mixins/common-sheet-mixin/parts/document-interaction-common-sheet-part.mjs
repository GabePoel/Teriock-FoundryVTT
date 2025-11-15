import _embeddedFromCard from "../methods/_embedded-from-card.mjs";

export default (Base) => {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends {DocumentSheetV2}
     * @property {TeriockCommon} document
     */
    class DocumentInteractionCommonSheetPart extends Base {
      /** @type {Partial<ApplicationConfiguration>} */
      static DEFAULT_OPTIONS = {
        actions: {
          chatDoc: this._chatDoc,
          openDoc: this._openDoc,
          rollDoc: this._rollDoc,
          toggleDisabledDoc: this._toggleDisabledDoc,
          useOneDoc: this._useOneDoc,
        },
      };

      /**
       * Sends an embedded document to chat.
       * @param {PointerEvent} _event - The event object.
       * @param {HTMLElement} target - The target element.
       * @returns {Promise<void>} Promise that resolves when chat is sent.
       */
      static async _chatDoc(_event, target) {
        const embedded = await _embeddedFromCard(this, target);
        await embedded?.toMessage({
          actor: this.actor,
        });
      }

      /**
       * Opens the sheet for an embedded document.
       * @param {PointerEvent} _event - The event object.
       * @param {HTMLElement} target - The target element.
       * @returns {Promise<void>} Promise that resolves when the sheet is opened.
       */
      static async _openDoc(_event, target) {
        const embedded = await _embeddedFromCard(this, target);
        await embedded?.sheet.render(true);
      }

      /**
       * Rolls an embedded document with optional advantage/disadvantage.
       * @param {PointerEvent} event - The event object.
       * @param {HTMLElement} target - The target element.
       * @returns {Promise<void>} Promise that resolves when roll is complete.
       */
      static async _rollDoc(event, target) {
        const embedded = await _embeddedFromCard(this, target);
        const options = embedded?.system?.parseEvent(event) || {};
        await embedded?.use(options);
      }

      /**
       * Toggles the disabled state of an embedded document.
       * @param {PointerEvent} _event - The event object.
       * @param {HTMLElement} target - The target element.
       * @returns {Promise<void>} Promise that resolves when toggle is complete.
       */
      static async _toggleDisabledDoc(_event, target) {
        if (!this.editable) {
          foundry.ui.notifications.warn(
            `Cannot toggle disabled. Sheet is not editable.`,
          );
          return;
        }
        const embedded = await _embeddedFromCard(this, target);
        await embedded?.toggleDisabled();
      }

      /**
       * Uses one unit of an embedded consumable document.
       * @param {PointerEvent} _event - The event object.
       * @param {HTMLElement} target - The target element.
       * @returns {Promise<void>} Promise that resolves when use is complete.
       */
      static async _useOneDoc(_event, target) {
        const embedded = await _embeddedFromCard(this, target);
        await embedded?.system.useOne();
      }
    }
  );
};
