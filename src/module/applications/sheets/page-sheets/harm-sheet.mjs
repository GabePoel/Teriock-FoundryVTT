import { TextField } from "../../../data/fields/_module.mjs";
import { systemPath } from "../../../helpers/path.mjs";
import { mix } from "../../../helpers/utils.mjs";
import {
  AutomationsCommonSheetPart,
  AutomationsTabsCommonSheetPart,
  ConnectionCommonSheetPart,
  MenuCommonSheetPart,
} from "../mixins/common-sheet-mixin/parts/_module.mjs";

const { JournalEntryPageProseMirrorSheet } =
  foundry.applications.sheets.journal;

/**
 * @extends {JournalEntryPageProseMirrorSheet}
 */
export default class HarmSheet extends mix(
  JournalEntryPageProseMirrorSheet,
  ConnectionCommonSheetPart,
  AutomationsTabsCommonSheetPart,
  AutomationsCommonSheetPart,
  MenuCommonSheetPart,
) {
  static DEFAULT_OPTIONS = {
    classes: ["teriock"],
    window: {
      resizable: true,
    },
    form: {
      closeOnSubmit: false,
      submitOnChange: true,
    },
    position: {
      height: 600,
      width: 560,
    },
  };

  static EDIT_PARTS = {
    all: {
      template: systemPath(
        "templates/document-templates/page-templates/harm-template.hbs",
      ),
      scrollable: [".window-content", ".tsheet-page", ".ab-sheet-everything"],
    },
  };

  /** @inheritDoc */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    return Object.assign(context, {
      TERIOCK,
      canHaveAutomations: true,
      img: this.document.system.img,
      imgPath: "system.img",
      system: this.document.system,
      systemFields: this.document.system.schema.fields,
      textField: new TextField({
        label: "Description",
      }),
      type: this.document.type,
      uuid: this.document.uuid,
    });
  }
}
