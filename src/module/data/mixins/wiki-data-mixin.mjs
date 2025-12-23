import { inferChildCompendiumSources } from "../../helpers/resolve.mjs";
import { toCamelCase } from "../../helpers/string.mjs";
import {
  fetchWikiPageHTML,
  openWikiPage,
} from "../../helpers/wiki/_module.mjs";

/**
 * @param {typeof ChildTypeModel} Base
 */
export default function WikiDataMixin(Base) {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends {ChildTypeModel}
     * @mixin
     */
    class WikiData extends Base {
      /** @inheritDoc */
      static get metadata() {
        return foundry.utils.mergeObject(super.metadata, { wiki: true });
      }

      /**
       * Whether this document is on the wiki.
       * @returns {boolean}
       */
      get isOnWiki() {
        const index =
          TERIOCK.index[TERIOCK.options.document[this.parent.type]["index"]];
        if (index) {
          return !!index[
            toCamelCase(
              foundry.utils.getProperty(this.parent, this.metadata.pageNameKey),
            )
          ];
        }
        return false;
      }

      /**
       * Gets the full wiki page path including namespace.
       * Constructs the wiki page identifier from namespace and parent name.
       * @returns {string} The complete wiki page path with namespace prefix.
       */
      get wikiPage() {
        const prefix = this.metadata.namespace;
        const pageName = foundry.utils.getProperty(
          this.parent,
          this.metadata.pageNameKey,
        );
        return `${prefix}:${pageName}`;
      }

      /**
       * Parses raw HTML content from the wiki into document data updates.
       * Converts wiki HTML content into structured data for document updates.
       * @param {string} _rawHTML - The raw HTML content fetched from the wiki.
       * @returns {Promise<object>} Promise that resolves to an object containing data updates.
       */
      async parse(_rawHTML) {
        return {
          "system.description": "Description.",
        };
      }

      /**
       * Opens the wiki page in the default browser.
       * Navigates to the wiki page URL for manual viewing and editing.
       */
      wikiOpen() {
        const pageTitle = this.wikiPage;
        if (this.isOnWiki) {
          ui.notifications.info(`Opening ${pageTitle}.`);
          openWikiPage(pageTitle);
        } else {
          ui.notifications.error(`${pageTitle} not found on the wiki.`);
        }
      }

      /**
       * Pulls data from the wiki and updates the document.
       * Fetches wiki page content, parses it, and applies updates to the document.
       * @param {Teriock.Wiki.PullOptions} [options] - Options for the wiki pull operation.
       * @returns {Promise<void>} Promise that resolves when the wiki pull is complete.
       */
      async wikiPull(options = {}) {
        const notify = options.notify !== false;
        if (game.settings.get("teriock", "developerMode")) {
          const pageTitle = this.wikiPage;
          if (notify) {
            ui.notifications.info(`Pulling ${pageTitle} from wiki.`);
          }

          const wikiPage = await fetchWikiPageHTML(pageTitle, {
            simplifyWikiLinks: false,
          });
          if (wikiPage) {
            const parsed = await this.parse(wikiPage);
            await this.parent.update(parsed);
            if (notify) {
              ui.notifications.success(
                `Updated ${this.parent.name} with ${pageTitle} wiki data.`,
              );
            }
          } else {
            if (notify) {
              ui.notifications.error(`${pageTitle} not found on wiki.`);
            }
          }
          await inferChildCompendiumSources(this.parent);
        } else if (notify) {
          ui.notifications.error(`Only developers can pull from the wiki.`);
        }
      }
    }
  );
}
