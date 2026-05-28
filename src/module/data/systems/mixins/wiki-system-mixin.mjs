import { toCamelCase } from "../../../helpers/string.mjs";

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
       * Whether this document is on the [wiki](https://wiki.teriock.com).
       * @returns {boolean}
       */
      get isOnWiki() {
        const index = TERIOCK.index[TERIOCK.config.document[this.parent.type].index];
        if (index) {
          return Boolean(index[toCamelCase(foundry.utils.getProperty(this.parent, this.metadata.pageNameKey))]);
        }
        return false;
      }

      /**
       * Gets the full name of this document's [wiki](https://wiki.teriock.com) page.
       * @returns {string}
       */
      get wikiPage() {
        const prefix = this.metadata.namespace;
        const pageName = foundry.utils.getProperty(this.parent, this.metadata.pageNameKey);
        return `${prefix}:${pageName}`;
      }

      /**
       * Opens the [wiki](https://wiki.teriock.com) page in the default browser.
       */
      wikiOpen() {
        const title = this.wikiPage;
        if (this.isOnWiki) {
          ui.notifications.info("TERIOCK.SYSTEMS.Wiki.DIALOG.open.opening", {
            format: { value: title },
            localize: true,
          });
          const pageUrl = `${TERIOCK.config.wiki.address}/${encodeURIComponent(title)}`;
          window.open(pageUrl, "_blank");
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
