import { makeIconClass } from "../../../helpers/icon.mjs";
import { BaseApplicationMixin } from "../../api/mixins/_module.mjs";

const { JournalEntrySheet } = foundry.applications.sheets.journal;

/**
 * @extends {JournalEntrySheet}
 * @mixes BaseApplicationMixin
 */
export default class BaseJournalSheet extends BaseApplicationMixin(JournalEntrySheet) {
  /** @inheritDoc */
  static DEFAULT_OPTIONS = { window: { icon: makeIconClass(CONFIG.JournalEntry.sidebarIcon, "title") } };

  /**
   * Get a journal entry page from some list item.
   * @param {HTMLLIElement} li
   * @returns {TeriockJournalEntryPage}
   */
  #getPage(li) {
    return this.entry.pages.get(li.dataset.pageId);
  }

  /** @inheritDoc */
  _getEntryContextOptions() {
    return [...super._getEntryContextOptions(), {
      icon: makeIconClass(TERIOCK.display.icons.ui.wiki, "contextMenu"),
      label: _loc("TERIOCK.SYSTEMS.Common.MENU.viewOnWiki"),
      onClick: (_ev, li) => this.#getPage(li)?.system?.wikiOpen(),
      visible: li => this.#getPage(li)?.system?.isOnWiki,
    }];
  }

  /** @inheritDoc */
  isPageVisible(page) {
    return super.isPageVisible(page) && !page.getFlag("teriock", "hiddenSubpage");
  }
}
