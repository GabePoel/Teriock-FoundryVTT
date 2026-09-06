import { icons } from "../../../constants/display/_module.mjs";
import { makeIconClass } from "../../../helpers/icon.mjs";
import { DocumentSettingsSheet } from "../utility-sheets/_module.mjs";

/**
 * @import { ApplicationConfiguration } from "@client/applications/_types.mjs";
 */

/**
 * @template {AnyConstructor} T
 * @param {T} Base
 * @returns {MixinResult<T, SystemSettingsButtonSheet>}
 */
export default function SystemSettingsButtonSheetMixin(Base) {
  /** @mixin */
  class SystemSettingsButtonSheet extends Base {
    /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
    static DEFAULT_OPTIONS = {
      actions: { openDocumentSettings: this._onOpenDocumentSettings },
      window: {
        controls: [{
          action: "openDocumentSettings",
          icon: makeIconClass(icons.manifest.ui.configure, "contextMenu"),
          label: "TERIOCK.SYSTEMS.Common.MENU.configureDocument",
          ownership: "OWNER",
          visible() {
            return this.isEditable;
          },
        }],
      },
    };

    /**
     * Open the settings sheet for this document.
     * @returns {Promise<void>}
     */
    static async _onOpenDocumentSettings() {
      await DocumentSettingsSheet.create({ document: this.document, sheetConfig: false });
    }
  }

  return SystemSettingsButtonSheet;
}
