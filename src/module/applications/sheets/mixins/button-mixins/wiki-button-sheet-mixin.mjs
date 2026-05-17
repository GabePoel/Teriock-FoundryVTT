/**
 * @param {typeof TeriockDocumentSheet} Base
 */
export default function WikiButtonSheetMixin(Base) {
  return (
    /**
     * @extends {TeriockDocumentSheet}
     * @property {WikiSystem} document.system
     * @mixin
     */
    class WikiButtonSheet extends Base {
      /**
       * Opens the wiki page for the current document.
       * @returns {Promise<void>}
       */
      static async #onWikiOpenThis() {
        this.document.system.wikiOpen();
      }

      /** @type {Partial<ApplicationConfiguration>} */
      static DEFAULT_OPTIONS = {
        actions: { wikiOpenThis: this.#onWikiOpenThis },
      };
    }
  );
}
