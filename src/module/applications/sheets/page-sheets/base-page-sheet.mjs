import { mixClasses } from "../../../helpers/construction.mjs";
import { BaseSheetMixin, DisplaySheetMixin } from "../mixins/_module.mjs";
import { SystemSettingsButtonSheetMixin } from "../mixins/button-mixins/_module.mjs";
import {
  AutomationsCommonSheetPart,
  AutomationsTabsCommonSheetPart,
  ConnectionCommonSheetPart,
  DragDropCommonSheetPart,
  LockingCommonSheetPart,
  MenuCommonSheetPart,
} from "../mixins/common-sheet-mixin/parts/_module.mjs";

const { JournalEntryPageProseMirrorSheet } = foundry.applications.sheets.journal;

/**
 * @extends {JournalEntryPageProseMirrorSheet}
 * @mixes BaseApplication
 * @mixes DisplaySheet
 * @mixes SystemSettingsButtonSheet
 * @property {TeriockJournalEntryPage} document
 */
export default class BasePageSheet
  extends mixClasses(
    JournalEntryPageProseMirrorSheet,
    BaseSheetMixin,
    DisplaySheetMixin,
    SystemSettingsButtonSheetMixin,
    ConnectionCommonSheetPart,
    DragDropCommonSheetPart,
    LockingCommonSheetPart,
    MenuCommonSheetPart,
    AutomationsCommonSheetPart,
    AutomationsTabsCommonSheetPart,
  )
{
  /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
  static DEFAULT_OPTIONS = {
    classes: ["teriock", "unpadded"],
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
