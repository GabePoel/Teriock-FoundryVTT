import { getPackIcon } from "../../../helpers/html.mjs";
import { makeIconClass } from "../../../helpers/icon.mjs";
import { DocumentDirectoryMixin } from "../tabs/_module.mjs";

const { Compendium } = foundry.applications.sidebar.apps;

/**
 * @mixes TeriockDocumentDirectory
 * @extends {Compendium}
 */
export default class TeriockCompendium extends DocumentDirectoryMixin(Compendium) {
  static _entryPartial = "teriock/sidebar/index-partial";

  /**
   * Remove entries with sups from the context tree.
   * @param {object} node
   */
  #purgeContextTree(node) {
    if (!node?.entries?.length && !node?.children?.length) { return; }
    node.entries = node.entries.filter(e => !foundry.utils.getProperty(e, "system._sup"));
    for (const c of node.children ?? []) { this.#purgeContextTree(c); }
  }

  /** @inheritDoc */
  get _tooltipSettingsKey() {
    return "compendiumTooltips";
  }

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
  async _getEntryFromLi(li) {
    return this.collection?.getDocument(li.dataset.entryId);
  }

  /** @inheritDoc */
  async _prepareDirectoryContext(context, options) {
    if (this.collection?.index) {
      if (!this.collection._reindexing) { this.collection._reindexing = this.collection.getIndex(); }
      await this.collection._reindexing;
    }
    await super._prepareDirectoryContext(context, options);
    this.#purgeContextTree(context?.tree);
  }

  /** @inheritDoc */
  async _prepareHeaderContext(context, options) {
    await super._prepareHeaderContext(context, options);
    // Allow use of custom compendium icons. This has the added quirk of changing the journal entry icons and not just
    // the header. But maybe that's not a bad thing?
    context.sidebarIcon = makeIconClass(getPackIcon(this.collection), "solid");
  }

  /** @inheritDoc */
  _validateOpenPanelEntryContextOption() {
    return game.settings.get("teriock", "openPanelContextMenuEntry")
      && ["ActiveEffect", "Actor", "Item"].includes(this.documentName);
  }
}
