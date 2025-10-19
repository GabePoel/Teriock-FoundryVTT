import { TeriockDialog } from "../../../api/_module.mjs";

export default (Base) => {
  return class WikiButtonSheetMixin extends Base {
    static DEFAULT_OPTIONS = {
      actions: {
        wikiOpenThis: this._wikiOpenThis,
        wikiPullThis: this._wikiPullThis,
      },
      window: {
        controls: [
          {
            icon: "fa-solid fa-globe",
            label: "View on Wiki",
            action: "wikiOpenThis",
          },
          {
            icon: "fa-solid fa-arrow-down-to-line",
            label: "Pull from Wiki",
            action: "wikiPullThis",
          },
        ],
      },
    };

    /**
     * Opens the wiki page for the current document.
     * @param {PointerEvent} _event - The event object.
     * @param {HTMLElement} _target - The target element.
     * @returns {Promise<void>} Promise that resolves when wiki page is opened.
     */
    static async _wikiOpenThis(_event, _target) {
      this.document.system.wikiOpen();
    }

    /**
     * Pulls data from wiki for the current document.
     * @param {PointerEvent} _event - The event object.
     * @param {HTMLElement} _target - The target element.
     * @returns {Promise<void>} Promise that resolves when wiki pull is complete.
     */
    static async _wikiPullThis(_event, _target) {
      if (this.editable) {
        const proceed = await TeriockDialog.confirm({
          content:
            "Are you sure you would like to pull this from the wiki? It will alter its content and may delete" +
            " important information.",
          modal: true,
          window: { title: "Confirm Wiki Pull" },
        });
        if (proceed) {
          this.document.system.wikiPull();
        }
      } else {
        foundry.ui.notifications.warn(
          `Cannot pull ${this.document.name} from wiki. Sheet is not editable.`,
        );
      }
    }
  };
};
