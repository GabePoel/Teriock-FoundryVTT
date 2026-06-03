import { icons } from "../../../../constants/display/icons.mjs";
import { makeIconClass } from "../../../../helpers/utils.mjs";
import { DocumentSettingsSheet } from "../../utility-sheets/_module.mjs";

/**
 * @param {typeof TeriockDocumentSheet} Base
 */
export default function SystemSettingsButtonSheetMixin(Base) {
  /**
   * @extends {TeriockDocumentSheet}
   * @mixin
   */
  return class SystemSettingsButtonSheet extends Base {
    /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
    static DEFAULT_OPTIONS = {
      actions: { openDocumentSettings: this._onOpenDocumentSettings },
      window: {
        controls: [{
          action: "openDocumentSettings",
          icon: makeIconClass(icons.ui.configure, "contextMenu"),
          label: "TERIOCK.SYSTEMS.Common.MENU.configureDocument",
          ownership: "OWNER",
        }],
      },
    };

    /**
     * Open the settings sheet for this document.
     * @returns {Promise<void>}
     */
    static async _onOpenDocumentSettings() {
      const settingsSheet = new DocumentSettingsSheet({ document: this.document, sheetConfig: false });
      await settingsSheet.render({ force: true });
    }
  };
}
