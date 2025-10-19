import { TeriockDialog } from "../../../api/_module.mjs";

export default (Base) => {
  return class IndexButtonSheetMixin extends Base {
    static DEFAULT_OPTIONS = {
      actions: {
        refreshIndexThisHard: this._refreshIndexThisHard,
        refreshIndexThisSoft: this._refreshIndexThisSoft,
      },
      window: {
        controls: [
          {
            icon: "fa-solid fa-book-atlas",
            label: "Soft Index Refresh",
            action: "refreshIndexThisSoft",
          },
          {
            icon: "fa-solid fa-book-copy",
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
        foundry.ui.notifications.success(`Refreshed ${this.document.name}.`);
      } else {
        foundry.ui.notifications.warn(
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
        foundry.ui.notifications.success(`Refreshed ${this.document.name}.`);
      } else {
        foundry.ui.notifications.warn(
          `Cannot refresh ${this.document.name}. Sheet is not editable.`,
        );
      }
    }
  };
};
