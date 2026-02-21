import { makeIconClass } from "../../../../helpers/utils.mjs";
import { DocumentSettingsSheet } from "../../utility-sheets/_module.mjs";

/**
 * @param {typeof TeriockDocumentSheet} Base
 */
export default function ConfigButtonSheetMixin(Base) {
  /**
   * @extends {TeriockDocumentSheet}
   * @mixin
   */
  return class ConfigButtonSheet extends Base {
    /** @type {Partial<ApplicationConfiguration>} */
    static DEFAULT_OPTIONS = /** @type {Partial<ApplicationConfiguration>} */ {
      actions: {
        openDocumentSettings: this._onOpenDocumentSettings,
      },
      window: {
        controls: [
          {
            action: "openDocumentSettings",
            icon: makeIconClass("gear-code", "contextMenu"),
            label: "TERIOCK.SYSTEMS.Common.MENU.configureDocument",
            ownership: "OWNER",
          },
        ],
      },
    };

    /**
     * Open the settings sheet for this document.
     * @returns {Promise<void>}
     */
    static async _onOpenDocumentSettings() {
      const settingsSheet = new DocumentSettingsSheet({
        document: this.document,
        sheetConfig: false,
      });
      await settingsSheet.render({ force: true });
    }
  };
}
