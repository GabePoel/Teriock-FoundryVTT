import { makeIconClass } from "../../../../helpers/utils.mjs";
import { refreshFromCompendiumDialog } from "../../../dialogs/_module.mjs";

/**
 * @param {typeof DocumentSheetV2} Base
 */
export default function IndexButtonSheetMixin(Base) {
  /**
   * @extends {DocumentSheetV2}
   * @mixin
   */
  return class IndexButtonSheet extends Base {
    /** @type {Partial<ApplicationConfiguration>} */
    static DEFAULT_OPTIONS = {
      actions: {
        refreshFromCompendium: this._onRefreshFromCompendium,
      },
      window: {
        controls: [
          {
            action: "refreshFromCompendium",
            icon: makeIconClass("book-atlas", "contextMenu"),
            label: "Compendium Refresh",
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
