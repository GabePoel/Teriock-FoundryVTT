import { makeIconClass } from "../../../../helpers/utils.mjs";
import { DocumentSettingsSheet } from "../../utility-sheets/_module.mjs";

/**
 * @param {typeof DocumentSheetV2} Base
 * @constructor
 */
export default function ConfigButtonSheetMixin(Base) {
  /**
   * @mixin
   */
  return class ConfigButtonSheet extends Base {
    /** @type {Partial<ApplicationConfiguration>} */
    static DEFAULT_OPTIONS = {
      actions: {
        openDocumentSettings: this._onOpenDocumentSettings,
      },
      window: {
        controls: [
          {
            action: "openDocumentSettings",
            icon: makeIconClass("gear-code", "contextMenu"),
            label: "Configure Document",
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
