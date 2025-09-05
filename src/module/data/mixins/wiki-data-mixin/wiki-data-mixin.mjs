import { mergeFreeze } from "../../../helpers/utils.mjs";
import { fetchWikiPageHTML, openWikiPage } from "../../../helpers/wiki/_module.mjs";

/**
 * Mixin that provides wiki integration functionality for document data models.
 * Adds wiki page fetching, parsing, and opening capabilities.
 * @param {typeof ChildTypeModel} Base - The base class to mix in with.
 */
export default (Base) => {
  return (
    /**
     * @implements {WikiDataMixinInterface}
     * @extends ChildTypeModel
     */
    class WikiDataMixin extends Base {
      /** @inheritDoc */
      static metadata = mergeFreeze(Base.metadata, { wiki: true });

      /** @inheritDoc */
      get wikiPage() {
        const prefix = this.constructor.metadata.namespace;
        const pageName = foundry.utils.getProperty(
          this.parent,
          this.constructor.metadata.pageNameKey,
        );
        return `${prefix}:${pageName}`;
      }

      /** @inheritDoc */
      async parse(_rawHTML) {
        return {
          "system.description": "Description.",
        };
      }

      /** @inheritDoc */
      wikiOpen() {
        // this.parent.hookCall?.("wikiOpen");
        const pageTitle = this.wikiPage;
        ui.notifications.info(`Opening ${pageTitle}.`);
        openWikiPage(pageTitle);
      }

      /** @inheritDoc */
      async wikiPull(options = {}) {
        const notify = options.notify !== false;
        // this.parent.hookCall?.("wikiPull");
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
      }
    }
  );
};
