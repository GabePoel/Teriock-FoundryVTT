import { fetchWikiPageHTML, openWikiPage } from "../../helpers/wiki.mjs";

/**
 * Mixin that provides wiki integration functionality for document data models.
 * Adds wiki page fetching, parsing, and opening capabilities.
 *
 * @param {TypeDataModel} Base - The base class to mix in with.
 */
export default (Base) => {
  return class WikiDataMixin extends Base {
    /**
     * Gets the full wiki page path including namespace.
     * Constructs the wiki page identifier from namespace and parent name.
     *
     * @returns {string} The complete wiki page path with namespace prefix.
     */
    get wikiPage() {
      const prefix = this.wikiNamespace ? `${this.wikiNamespace}:` : "";
      return `${prefix}${this.parent.name}`;
    }

    /**
     * Parses raw HTML content from the wiki into document data updates.
     * Converts wiki HTML content into structured data for document updates.
     *
     * @param {string} rawHTML - The raw HTML content fetched from the wiki.
     * @returns {Promise<object>} Promise that resolves to an object containing data updates.
     */
    async parse(rawHTML) {
      return {
        "system.description": "Description.",
      };
    }

    /**
     * Pulls data from the wiki and updates the document.
     * Fetches wiki page content, parses it, and applies updates to the document.
     *
     * @param {Teriock.WikiPullOptions} options - Options for the wiki pull operation.
     * @returns {Promise<void>} Promise that resolves when the wiki pull is complete.
     */
    async wikiPull(options = {}) {
      const notify = options.notify !== false;
      this.parent.hookCall?.("wikiPull");

      const pageTitle = this.wikiPage;
      if (notify) {
        ui.notifications.info(`Pulling ${pageTitle} from wiki.`);
      }

      const wikiPage = await fetchWikiPageHTML(pageTitle);
      if (wikiPage) {
        const parsed = await this.parse(wikiPage);
        await this.parent.update(parsed);
        if (notify) {
          ui.notifications.success(`Updated ${this.parent.name} with ${pageTitle} wiki data.`);
        }
      } else {
        if (notify) {
          ui.notifications.error(`${pageTitle} not found on wiki.`);
        }
      }
    }

    /**
     * Opens the wiki page in the default browser.
     * Navigates to the wiki page URL for manual viewing and editing.
     *
     * @returns {void}
     */
    wikiOpen() {
      this.parent.hookCall?.("wikiOpen");
      const pageTitle = this.wikiPage;
      ui.notifications.info(`Opening ${pageTitle}.`);
      openWikiPage(pageTitle);
    }
  };
};
