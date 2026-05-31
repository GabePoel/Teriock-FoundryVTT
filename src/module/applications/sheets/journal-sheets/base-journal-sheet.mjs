import { makeIconClass } from "../../../helpers/utils.mjs";

const { JournalEntrySheet } = foundry.applications.sheets.journal;

console.log(JournalEntrySheet);

export default class BaseJournalSheet extends JournalEntrySheet {
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
}
