import { makeIconClass } from "../../../../helpers/utils.mjs";
import { refreshFromCompendiumDialog } from "../../../dialogs/_module.mjs"; //noinspection JSValidateJSDoc

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
      actions: {
        refreshFromCompendium: this._onRefreshFromCompendium,
      },
      window: {
        controls: [
          {
            action: "refreshFromCompendium",
            icon: makeIconClass("book-atlas", "contextMenu"),
            label: "TERIOCK.SYSTEMS.Common.MENU.compendiumRefresh",
            ownership: "OWNER",
          },
        ],
      },
    };

    /**
     * Refresh this document from the index.
     * @returns {Promise<void>}
     */
    static async _onRefreshFromCompendium() {
      await refreshFromCompendiumDialog(this.document);
    }
  };
}
