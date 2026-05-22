import { mixClasses } from "../../../helpers/construction.mjs";
import DisplaySheetMixin from "./display-sheet-mixin.mjs";

/**
 * {@link AnyChildDocument} sheet mixin.
 * @param {typeof CommonSheet} Base
 */
export default function ChildSheetMixin(Base) {
  return (
    /**
     * @extends {CommonSheet}
     * @mixes DisplaySheet
     * @mixin
     * @property {AnyChildDocument} document
     */
    class ChildSheet extends mixClasses(Base, DisplaySheetMixin) {
      /**
       * Open this document's elder if it exists.
       * @returns {Promise<void>}
       */
      static async #onOpenSource() {
        await this.document.master?.sheet.render(true);
      }

      /** @type {string[]} */
      static BARS = [];

      /** @type {Partial<ApplicationConfiguration>} */
      static DEFAULT_OPTIONS = { actions: { openSource: this.#onOpenSource } };

      /** @type {Record<string, HandlebarsTemplatePart>} */
      static PARTS = { ...this.DISPLAY_PARTS };
    }
  );
}
