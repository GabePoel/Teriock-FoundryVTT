import { makeIconClass } from "../../../../helpers/utils.mjs";
import { TeriockDialog } from "../../../api/_module.mjs";

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
        refreshIndexThisHard: this._refreshIndexThisHard,
        refreshIndexThisSoft: this._refreshIndexThisSoft,
      },
      window: {
        controls: [
          {
            icon: makeIconClass("book-atlas", "contextMenu"),
            label: "Soft Index Refresh",
            action: "refreshIndexThisSoft",
          },
          {
            icon: makeIconClass("book-copy", "contextMenu"),
            label: "Hard Index Refresh",
            action: "refreshIndexThisHard",
          },
        ],
      },
    };

    /**
     * Refresh this document from the index.
     * @returns {Promise<void>}
     */
    static async _refreshIndexThisHard() {
      if (this.editable) {
        const proceed = await TeriockDialog.confirm({
          content:
            "Are you sure you would like to refresh this? It will alter its content and may delete important" +
            " information.",
          modal: true,
          window: { title: "Confirm Hard Refresh" },
        });
        if (proceed) {
          await this.document.system.hardRefreshFromIndex();
        }
        ui.notifications.success(`Refreshed ${this.document.name}.`);
      } else {
        ui.notifications.warn(
          `Cannot refresh ${this.document.name}. Sheet is not editable.`,
        );
      }
    }

    /**
     * Refresh this document from the index.
     * @returns {Promise<void>}
     */
    static async _refreshIndexThisSoft() {
      if (this.editable) {
        const proceed = await TeriockDialog.confirm({
          content:
            "Are you sure you would like to refresh this? It will alter its content and may delete important" +
            " information.",
          modal: true,
          window: { title: "Confirm Soft Refresh" },
        });
        if (proceed) {
          await this.document.system.refreshFromIndex();
        }
        ui.notifications.success(`Refreshed ${this.document.name}.`);
      } else {
        ui.notifications.warn(
          `Cannot refresh ${this.document.name}. Sheet is not editable.`,
        );
      }
    }
  };
}
