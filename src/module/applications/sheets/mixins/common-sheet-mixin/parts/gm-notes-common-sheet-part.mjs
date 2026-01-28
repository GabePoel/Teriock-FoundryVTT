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
    class GmNotesCommonSheetPart extends Base {
      /** @type {Partial<ApplicationConfiguration>} */
      static DEFAULT_OPTIONS = {
        actions: {
          gmNotesOpen: this._onGmNotesOpen,
        },
      };

      /**
       * Opens the GM notes page or makes one if one doesn't already exist.
       * @returns {Promise<void>}
       */
      static async _onGmNotesOpen() {
        await this.document.system.gmNotesOpen();
      }
    }
  );
};
