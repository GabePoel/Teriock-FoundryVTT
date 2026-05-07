import { icons } from "../../../../constants/display/icons.mjs";
import { makeIconClass } from "../../../../helpers/utils.mjs";
import { SourceRefreshDialog } from "../../../dialogs/_module.mjs";

/**
 * @param {typeof TeriockDocumentSheet} Base
 */
export default function IndexButtonSheetMixin(Base) {
  /**
   * @extends {TeriockDocumentSheet}
   * @mixin
   */
  return class IndexButtonSheet extends Base {
    /** @type {Partial<ApplicationConfiguration>} */
    static DEFAULT_OPTIONS = /** @type {Partial<ApplicationConfiguration>} */ {
      actions: { sourceRefresh: this._onSourceRefresh },
      window: {
        controls: [
          {
            action: "sourceRefresh",
            icon: makeIconClass(icons.ui.sourceRefresh, "contextMenu"),
            label: "TERIOCK.SYSTEMS.Common.MENU.sourceRefresh",
            ownership: "OWNER",
          },
        ],
      },
    };

    /**
     * Refresh this document from the index.
     * @returns {Promise<void>}
     */
    static async _onSourceRefresh() {
      const dialog = new SourceRefreshDialog({ document: this.document });
      await dialog.render(true);
    }
  };
}
