import { mixClasses } from "../../../helpers/construction.mjs";
import { bindCommonActions } from "../../shared/_module.mjs";
import { BaseApplicationMixin } from "../../shared/mixins/_module.mjs";
import { DisplaySheetMixin } from "../mixins/_module.mjs";
import { ConfigButtonSheetMixin } from "../mixins/button-mixins/_module.mjs";
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
 * @mixes ConfigButtonSheet
 */
export default class BasePageSheet
  extends mixClasses(
    JournalEntryPageProseMirrorSheet,
    BaseApplicationMixin,
    DisplaySheetMixin,
    ConfigButtonSheetMixin,
    ConnectionCommonSheetPart,
    DragDropCommonSheetPart,
    LockingCommonSheetPart,
    MenuCommonSheetPart,
    AutomationsCommonSheetPart,
    AutomationsTabsCommonSheetPart,
  )
{
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
  async _onRender(context, options) {
    await super._onRender(context, options);
    bindCommonActions(this.element);
  }

  /** @inheritDoc */
  async _prepareContext(options) {
    return Object.assign(await super._prepareContext(options), {
      canHaveAutomations: false,
      img: this.document.system.img,
      imgPath: "system.img",
      system: this.document.system,
      systemFields: this.document.system.schema.fields,
      TERIOCK,
      type: this.document.type,
      uuid: this.document.uuid,
    });
  }
}
