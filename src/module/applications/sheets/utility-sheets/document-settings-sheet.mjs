import { icons } from "../../../constants/display/icons.mjs";
import { makeIconClass } from "../../../helpers/utils.mjs";
import TeriockDocumentSheet from "./document-sheet.mjs";

export default class DocumentSettingsSheet extends TeriockDocumentSheet {
  /** @inheritDoc */
  static DEFAULT_OPTIONS = {
    form: {
      closeOnSubmit: false,
      submitOnChange: true,
    },
    position: {
      width: 600,
      height: 500,
    },
    window: {
      resizable: true,
      icon: makeIconClass(icons.ui.configure, "title"),
    },
  };
  /** @inheritDoc */
  static PARTS = {
    all: {
      template: "teriock/sheets/utility/document-config",
      scrollable: [""],
    },
  };

  /** @inheritDoc */
  async _prepareContext(options = {}) {
    const context = await super._prepareContext(options);
    const sheetSettings = {};
    const otherSettings = {};
    if (this.document.flags.teriockDocumentSettings) {
      Object.entries(this.document.flags.teriockDocumentSettings).forEach(
        ([key, value]) => {
          if (key.startsWith("sheet")) {
            sheetSettings[key] = value;
          } else {
            otherSettings[key] = value;
          }
        },
      );
    }
    Object.assign(context, {
      hasQualifiers: !!this.document.system?.qualifiers,
      hasCompendiumSource:
        !!this.document._stats &&
        (!!this.document._stats?.compendiumSource ||
          this.document._stats?.compendiumSource === null),
      sheetSettings,
      otherSettings,
      hasSheetSettings: Object.keys(sheetSettings).length > 0,
      hasOtherSettings: Object.keys(otherSettings).length > 0,
      id: this.id,
    });
    return context;
  }
}
