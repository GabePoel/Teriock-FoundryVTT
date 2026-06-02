import { getPackIcon } from "../../helpers/html.mjs";
import { makeIconClass } from "../../helpers/utils.mjs";

const { Compendium } = foundry.applications.sidebar.apps;

export default class TeriockCompendium extends Compendium {
  static _entryPartial = "teriock/sidebar/index-partial";

  /** @inheritDoc */
  _getEntryContextOptions() {
    return [...super._getEntryContextOptions(), {
      icon: makeIconClass(TERIOCK.display.icons.ui.duplicate, "contextMenu"),
      label: "TERIOCK.COMPENDIUM.DuplicateEntry",
      visible: game.user.isGM && !this.collection?.locked,
      onClick: async (_ev, li) => {
        const document = await this.collection?.getDocument(li.dataset.entryId);
        await document?.duplicate();
      },
    }];
  }

  /** @inheritDoc */
  async _onRender(context, options) {
    await super._onRender(context, options);
    let docs = this.collection;
    if (this.collection?.index) {
      if (!this.collection._reindexing) { this.collection._reindexing = this.collection.getIndex(); }
      await this.collection._reindexing;
      docs = this.collection.index;
      for (const doc of docs) {
        if (foundry.utils.getProperty(doc, "system._sup")) {
          this.element?.querySelector(`[data-entry-id="${doc?._id}"]`)?.remove();
        }
      }
    }
  }

  /** @inheritDoc */
  async _prepareContext(options = {}) {
    const context = await super._prepareContext(options);
    if (game.teriock.getSetting("compendiumTooltips")) { context.makeTooltip = true; }
    return context;
  }

  /** @inheritDoc */
  async _prepareHeaderContext(context, options) {
    await super._prepareHeaderContext(context, options);
    // Allow use of custom compendium icons. This has the added quirk of changing the journal entry icons and not just
    // the header. But maybe that's not a bad thing?
    context.sidebarIcon = makeIconClass(getPackIcon(this.collection), "solid");
  }
}
