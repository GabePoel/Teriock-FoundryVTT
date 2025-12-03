import { makeIconClass } from "../../../../helpers/utils.mjs";
import { refreshFromCompendiumDialog } from "../../../dialogs/_module.mjs";

/**
 * @param {typeof DocumentSheetV2} Base
 * @constructor
 */
export default function IndexButtonSheetMixin(Base) {
  /**
   * @mixin
   */
  return class IndexButtonSheet extends Base {
    /** @type {Partial<ApplicationConfiguration>} */
    static DEFAULT_OPTIONS = {
      actions: {
        refreshFromCompendium: this._refreshFromCompendium,
      },
      window: {
        controls: [
          {
            icon: makeIconClass("book-atlas", "contextMenu"),
            label: "Compendium Refresh",
            action: "refreshFromCompendium",
          },
        ],
      },
    };

    /**
     * Refresh this document from the index.
     * @returns {Promise<void>}
     */
    static async _refreshFromCompendium() {
      await refreshFromCompendiumDialog(this.document);
    }
  };
}
