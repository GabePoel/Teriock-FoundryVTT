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
        configureDocument: this._onConfigureDocument,
      },
      window: {
        controls: [
          {
            action: "configureDocument",
            icon: makeIconClass("sliders", "contextMenu"),
            label: "Configure Document",
            ownership: "OWNER",
          },
        ],
      },
    };

    static async _onConfigureDocument() {
      await configureDocumentDialog(this.document);
    }
  };
}
