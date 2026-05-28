import { toCamelCase } from "../../../helpers/string.mjs";
import { openWikiPage } from "../../../helpers/wiki.mjs";

/**
 * @param {typeof ChildSystem} Base
 */
export default function WikiSystemMixin(Base) {
  return (
    /**
     * @extends {ChildSystem}
     * @mixin
     */
    class WikiSystem extends Base {
      /** @inheritDoc */
      static get metadata() {
        return foundry.utils.mergeObject(super.metadata, { wiki: true });
      }

      /**
       * Whether this document is on the wiki.
       * @returns {boolean}
       */
      get isOnWiki() {
        const index = TERIOCK.index[TERIOCK.config.document[this.parent.type]["index"]];
        if (index) { return Boolean(index[toCamelCase(foundry.utils.getProperty(this.parent, this.metadata.pageNameKey))]); }
        return false;
      }

      /**
       * Gets the full wiki page path including namespace.
       * Constructs the wiki page identifier from namespace and parent name.
       * @returns {string} The complete wiki page path with namespace prefix.
       */
      get wikiPage() {
        const prefix = this.metadata.namespace;
        const pageName = foundry.utils.getProperty(this.parent, this.metadata.pageNameKey);
        return `${prefix}:${pageName}`;
      }

      /**
       * Opens the wiki page in the default browser.
       * Navigates to the wiki page URL for manual viewing and editing.
       */
      wikiOpen() {
        const title = this.wikiPage;
        if (this.isOnWiki) {
          ui.notifications.info("TERIOCK.SYSTEMS.Wiki.DIALOG.open.opening", {
            format: { value: title },
            localize: true,
          });
          openWikiPage(title);
        } else {
          ui.notifications.error("TERIOCK.SYSTEMS.Wiki.DIALOG.open.error", {
            format: { value: title },
            localize: true,
          });
        }
      }
    }
  );
}
