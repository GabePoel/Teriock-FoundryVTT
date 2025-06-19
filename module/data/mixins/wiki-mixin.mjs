/** @import { WikiPullOptions } from "../../types/wiki" */
import { fetchWikiPageHTML, openWikiPage } from "../../helpers/wiki.mjs";

export const WikiDataMixin = (Base) =>
  class WikiDataMixin extends Base {
    /**
     * @returns {string} The full wiki page path, including namespace.
     */
    get wikiPage() {
      const prefix = this.wikiNamespace ? `${this.wikiNamespace}:` : "";
      return `${prefix}${this.parent.name}`;
    }

    /**
     * @param {string} rawHTML - The raw HTML content fetched from the wiki.
     * @returns {Promise<object>} An object representing data updates.
     */
    async parse(rawHTML) {
      return {
        "system.description": "Description.",
      };
    }

    /**
     * @param {WikiPullOptions} options
     * @returns {Promise<void>}
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
     * @returns {void}
     */
    wikiOpen() {
      this.parent.hookCall?.("wikiOpen");
      const pageTitle = this.wikiPage;
      ui.notifications.info(`Opening ${pageTitle}.`);
      openWikiPage(pageTitle);
    }
  };
