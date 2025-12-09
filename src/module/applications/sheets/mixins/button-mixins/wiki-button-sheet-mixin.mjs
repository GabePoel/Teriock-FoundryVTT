import { TeriockDialog } from "../../../api/_module.mjs";

/**
 * @param {typeof DocumentSheetV2} Base
 * @constructor
 */
export default function WikiButtonSheetMixin(Base) {
  /**
   * @mixin
   */
  return class WikiButtonSheet extends Base {
    /** @type {Partial<ApplicationConfiguration>} */
    static DEFAULT_OPTIONS = {
      actions: {
        wikiOpenThis: this.#onWikiOpenThis,
        wikiPullThis: this.#onWikiPullThis,
      },
    };

    /**
     * Opens the wiki page for the current document.
     * @returns {Promise<void>} Promise that resolves when wiki page is opened.
     */
    static async #onWikiOpenThis() {
      this.document.system.wikiOpen();
    }

    /**
     * Pulls data from wiki for the current document.
     * @returns {Promise<void>} Promise that resolves when wiki pull is complete.
     */
    static async #onWikiPullThis() {
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
        ui.notifications.warn(
          `Cannot pull ${this.document.name} from wiki. Sheet is not editable.`,
        );
      }
    }
  };
}
