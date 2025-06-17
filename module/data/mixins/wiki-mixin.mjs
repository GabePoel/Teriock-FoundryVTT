import { fetchWikiPageHTML, openWikiPage } from "../../helpers/wiki.mjs";

export const WikiDataMixin = (Base) => class WikiDataMixin extends Base {
  get wikiPage() {
    const prefix = this.wikiNamespace ? `${this.wikiNamespace}:` : '';
    return `${prefix}${this.parent.name}`
  }

  async parse(rawHTML) {
    return {
      "system.description": "Description.",
    }
  }

  /** @override */
  async wikiPull(options = {}) {
    const notify = options.notify ?? true;
    this.parent.hookCall('wikiPull');
    const pageTitle = this.wikiPage;
    if (notify) {
      ui.notifications.info(`Pulling ${this.wikiPage} from wiki.`);
    }
    const wikiPage = await fetchWikiPageHTML(pageTitle);
    if (wikiPage) {
      const parsed = await this.parse(wikiPage);
      await this.parent.update(parsed);
      if (notify) {
        ui.notifications.success(`Updated ${this.parent.name} with ${pageTitle} wiki data.`)
      }
    } else {
      if (notify) {
        ui.notifications.error(`${pageTitle} not found on wiki.`)
      }
    }
  }

  /** @override */
  wikiOpen() {
    this.parent.hookCall('wikiOpen');
    const pageTitle = this.wikiPage;
    ui.notifications.info(`Opening ${pageTitle}.`)
    openWikiPage(pageTitle);
  }
}