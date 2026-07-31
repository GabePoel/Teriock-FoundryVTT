import { mixClasses } from "../../../helpers/construction.mjs";
import { TeriockDocumentSheet } from "../../api/_module.mjs";
import * as sheetMixins from "../mixins/_module.mjs";

/**
 * @import { ApplicationConfiguration } from "@client/applications/_types.mjs";
 * @import { HandlebarsTemplatePart } from "@client/applications/api/handlebars-application.mjs";
 */

/**
 * A simple sheet for {@link AnyChildDocument}.
 * @extends {TeriockDocumentSheet}
 * @mixes DisplaySheet
 * @mixes CommonSheet
 * @mixes MechanicsSheet
 * @mixes MechanicsTabsSheet
 * @mixes StatDiceSheet
 */
export default class ChildSheet
  extends mixClasses(
    TeriockDocumentSheet,
    sheetMixins.DisplaySheetMixin,
    sheetMixins.CommonSheetMixin,
    sheetMixins.MechanicsSheetMixin,
    sheetMixins.MechanicsTabsSheetMixin,
    sheetMixins.StatDiceSheetMixin,
  )
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
