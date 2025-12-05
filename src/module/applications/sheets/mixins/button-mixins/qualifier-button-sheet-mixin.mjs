import { makeIconClass } from "../../../../helpers/utils.mjs";
import { configureDocumentDialog } from "../../../dialogs/_module.mjs";

/**
 * @param {typeof DocumentSheetV2} Base
 * @constructor
 */
export default function QualifierButtonSheetMixin(Base) {
  /**
   * @mixin
   */
  return class QualifierButtonSheet extends Base {
    /** @type {Partial<ApplicationConfiguration>} */
    static DEFAULT_OPTIONS = {
      actions: {
        configureDocument: this._configureDocument,
      },
      window: {
        controls: [
          {
            icon: makeIconClass("sliders", "contextMenu"),
            label: "Configure Document",
            action: "configureDocument",
          },
        ],
      },
    };

    static async _configureDocument() {
      await configureDocumentDialog(this.document);
    }
  };
}
