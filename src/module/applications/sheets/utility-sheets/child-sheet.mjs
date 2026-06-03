import { mixClasses } from "../../../helpers/construction.mjs";
import * as sheetMixins from "../mixins/_module.mjs";
import TeriockDocumentSheet from "./document-sheet.mjs";

/**
 * A simple sheet for {@link AnyChildDocument}.
 */
export default class ChildSheet
  extends mixClasses(TeriockDocumentSheet, sheetMixins.DisplaySheetMixin, sheetMixins.CommonSheetMixin)
{
  /**
   * Open this document's elder if it exists.
   * @returns {Promise<void>}
   */
  static async #onOpenSource() {
    await this.document.master?.sheet.render(true);
  }

  /** @type {string[]} */
  static BARS = [];

  /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
  static DEFAULT_OPTIONS = { actions: { openSource: this.#onOpenSource } };

  /** @type {Record<string, HandlebarsTemplatePart>} */
  static PARTS = { ...this.DISPLAY_PARTS };
}
