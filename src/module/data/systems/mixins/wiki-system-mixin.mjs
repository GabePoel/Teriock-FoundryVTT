import { mergeMetadata, parseIdentifier } from "../../../utils/_module.mjs";
/**
 * Mixin that makes it easy to access documents on the [wiki](https://wiki.teriock.com).
 * @template {MixinBase} T
 * @param {T} Base
 * @remarks A better way to handle this might just be to save wiki page links as part of the document's data IMO.
 */
export default function WikiSystemMixin(Base) {
  /** @mixin */
  class WikiSystem extends Base {
    /** @inheritDoc */
    static metadata = mergeMetadata(super.metadata, { tags: { wiki: true } });

    /**
     * Whether this document is on the [wiki](https://wiki.teriock.com).
     * @returns {boolean}
     */
    get isOnWiki() {
      return Boolean(this.wikiPage);
    }

    /**
     * The identifier of this document's [wiki](https://wiki.teriock.com) page.
     * @returns {Identifier}
     */
    get wikiIdentifier() {
      return this.parent.identifier;
    }

    /**
     * Gets the full name of this document's [wiki](https://wiki.teriock.com) page.
     * @returns {string}
     */
    get wikiPage() {
      const { slug, type } = parseIdentifier(this.wikiIdentifier);
      return TERIOCK.CONFIG.wiki.index[type]?.[slug] ?? "";
    }

    /**
     * Opens the [wiki](https://wiki.teriock.com) page in the default browser.
     */
    wikiOpen() {
      const title = this.wikiPage;
      if (this.isOnWiki) {
        ui.notifications.info("TERIOCK.SYSTEMS.Wiki.DIALOG.open.opening", { format: { value: title }, localize: true });
        const pageUrl = `${TERIOCK.CONST.WIKI_URL}/${encodeURIComponent(title)}`;
        window.open(pageUrl, "_blank");
      } else {
        ui.notifications.error("TERIOCK.SYSTEMS.Wiki.DIALOG.open.error", { format: { value: title }, localize: true });
      }
    }
  }

  return WikiSystem;
}
