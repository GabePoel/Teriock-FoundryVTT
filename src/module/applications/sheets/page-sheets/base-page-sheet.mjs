import { mixClasses } from "../../../helpers/construction.mjs";
import { BaseDocumentSheetMixin } from "../../api/_module.mjs";
import {
  DisplaySheetMixin,
  DragDropSheetMixin,
  LockingSheetMixin,
  MechanicsSheetMixin,
  MechanicsTabsSheetMixin,
  SystemSettingsButtonSheetMixin,
} from "../mixins/_module.mjs";

const { JournalEntryPageProseMirrorSheet } = foundry.applications.sheets.journal;

/**
 * @import { ApplicationConfiguration } from "@client/applications/_types.mjs";
 * @import { HandlebarsTemplatePart } from "@client/applications/api/handlebars-application.mjs";
 */

/**
 * @extends {JournalEntryPageProseMirrorSheet}
 * @mixes BaseDocumentSheet
 * @mixes DisplaySheet
 * @mixes SystemSettingsButtonSheet
 * @mixes DragDropSheet
 * @mixes LockingSheet
 * @mixes MechanicsSheet
 * @mixes MechanicsTabsSheet
 * @property {TeriockJournalEntryPage} document
 */
export default class BasePageSheet
  extends mixClasses(
    JournalEntryPageProseMirrorSheet,
    BaseDocumentSheetMixin,
    DisplaySheetMixin,
    SystemSettingsButtonSheetMixin,
    DragDropSheetMixin,
    LockingSheetMixin,
    MechanicsSheetMixin,
    MechanicsTabsSheetMixin,
  )
{
  /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
  static DEFAULT_OPTIONS = {
    form: { closeOnSubmit: false, submitOnChange: true },
    position: { height: 600, width: 560 },
    window: { resizable: true },
  };

  /** @type {Record<string, HandlebarsTemplatePart>} */
  static EDIT_PARTS = { ...this.DISPLAY_PARTS };

  /** @type {Record<string, HandlebarsTemplatePart>} */
  static VIEW_PARTS = { content: { template: "teriock/sheets/pages/text-view" } };

  /** @inheritDoc */
  _canRender(_options) {
    return true;
  }

  /** @inheritDoc */
  async _prepareContext(options) {
    return Object.assign(await super._prepareContext(options), { imgPath: "system.img" });
  }
}
