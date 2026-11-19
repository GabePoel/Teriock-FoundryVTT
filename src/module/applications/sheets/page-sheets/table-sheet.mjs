import { makeIconClass, mixClasses } from "../../../utils/_module.mjs";
import { BaseDocumentSheetMixin } from "../../api/_module.mjs";
import { SystemSettingsButtonSheetMixin } from "../mixins/_module.mjs";

const { JournalEntryPageHandlebarsSheet } = foundry.applications.sheets.journal;

/**
 * @extends {JournalEntryPageHandlebarsSheet}
 * @property {TeriockJournalEntryPage<"table">} document
 */
export default class TableSheet
  extends mixClasses(JournalEntryPageHandlebarsSheet, BaseDocumentSheetMixin, SystemSettingsButtonSheetMixin)
{
  /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
  static DEFAULT_OPTIONS = {
    form: { submitOnChange: true },
    window: { icon: makeIconClass(TERIOCK.DISPLAY.icons.manifest.document.sorcery, "title") },
  };

  /** @type {Record<string, HandlebarsTemplatePart>} */
  static EDIT_PARTS = {
    header: super.EDIT_PARTS.header,
    content: { template: "teriock/sheets/pages/table-edit" },
    footer: super.EDIT_PARTS.footer,
  };

  /** @type {Record<string, HandlebarsTemplatePart>} */
  static VIEW_PARTS = { content: { root: true, template: "teriock/sheets/pages/table-view" } };
}
