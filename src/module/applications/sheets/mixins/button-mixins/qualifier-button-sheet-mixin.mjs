import { makeIconClass } from "../../../../helpers/utils.mjs";
import { setQualifiersDialog } from "../../../dialogs/_module.mjs";

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
        setQualifiers: this._setQualifiers,
      },
      window: {
        controls: [
          {
            icon: makeIconClass("eye-low-vision", "contextMenu"),
            label: "Set Qualifiers",
            action: "setQualifiers",
          },
        ],
      },
    };

    static async _setQualifiers() {
      await setQualifiersDialog(this.document);
    }
  };
}
