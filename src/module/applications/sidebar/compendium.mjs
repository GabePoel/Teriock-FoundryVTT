import { systemPath } from "../../helpers/path.mjs";
import { bindCommonActions } from "../shared/_module.mjs";

const { Compendium } = foundry.applications.sidebar.apps;

export default class TeriockCompendium extends Compendium {
  static _entryPartial = systemPath("templates/sidebar/index-partial.hbs");

  async _onRender(context, options) {
    await super._onRender(context, options);
    let docs = this.collection;
    if (this.collection?.index) {
      if (!this.collection._reindexing) {
        this.collection._reindexing = this.collection.getIndex();
      }
      await this.collection._reindexing;
      docs = this.collection.index;
      for (const doc of docs) {
        if (foundry.utils.getProperty(doc, "system._sup")) {
          this.element
            ?.querySelector(`[data-entry-id="${doc?._id}"]`)
            ?.remove();
        }
      }
    }
    if (game.settings.get("teriock", "compendiumTooltips")) {
      bindCommonActions(this.element);
    }
  }
}
