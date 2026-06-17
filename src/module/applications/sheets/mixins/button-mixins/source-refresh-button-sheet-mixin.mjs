import { icons } from "../../../../constants/display/icons.mjs";
import { makeIconClass } from "../../../../helpers/utils.mjs";
import { SourceRefreshDialog } from "../../../dialogs/_module.mjs";

/**
 * @param {typeof TeriockDocumentSheet} Base
 */
export default function SourceRefreshButtonSheetMixin(Base) {
  /**
   * @extends {TeriockDocumentSheet}
   * @mixin
   */
  return class SourceRefreshButtonSheet extends Base {
    /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
    static DEFAULT_OPTIONS = {
      actions: { sourceRefresh: this._onSourceRefresh },
      window: {
        controls: [{
          action: "sourceRefresh",
          icon: makeIconClass(icons.ui.compendium, "contextMenu"),
          label: "TERIOCK.SYSTEMS.Common.MENU.sourceRefresh",
          ownership: "OWNER",
        }],
      },
    };

    /**
     * Refresh this document from the index.
     * @returns {Promise<void>}
     */
    static async _onSourceRefresh() {
      await SourceRefreshDialog.create({ document: this.document });
    }
  };
}
