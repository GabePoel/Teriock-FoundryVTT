import { fetchWikiPageHTML, openWikiPage } from "../../helpers/wiki.mjs";

const TeriockWikiMixin = (Base) => class TeriockWikiMixin extends Base {
  getWikiPage() {
    const prefix = this.system?.wikiNamespace ? `${this.system.wikiNamespace}:` : '';
    return `${prefix}${this.name}`
  }

  /** @override */
  async wikiPull() {
    const pageTitle = this.getWikiPage();
    ui.notifications.info(`Pulling ${pageTitle} from wiki.`)
    const wikiPage = await fetchWikiPageHTML(pageTitle);
    if (wikiPage) {
      const parsed = await this.parse(wikiPage, this.document);
      console.log(`Parsed wiki page for ${this.name}:`, parsed);
      await this.update(parsed);
      ui.notifications.success(`Updated ${this.name} with ${pageTitle} wiki data.`)
    } else {
      ui.notifications.error(`${pageTitle} not found on wiki.`)
    }
  }

  /** @override */
  async wikiOpen() {
    const pageTitle = this.getWikiPage();
    ui.notifications.info(`Opening ${pageTitle}.`)
    openWikiPage(pageTitle);
  }
}

export default TeriockWikiMixin;