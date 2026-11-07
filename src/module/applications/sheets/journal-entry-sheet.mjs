import { makeIconClass, mixClasses } from "../../utils/_module.mjs";
import { BaseApplicationMixin } from "../api/mixins/_module.mjs";
import { RulebookUpdater } from "../dialogs/_module.mjs";

const { JournalEntrySheet } = foundry.applications.sheets.journal;

/**
 * @extends {JournalEntrySheet}
 * @mixes BaseApplication
 */
export default class TeriockJournalEntrySheet extends mixClasses(JournalEntrySheet, BaseApplicationMixin) {
  /**
   * Update rulebook flags.
   * @returns {Promise<void>}
   * @this {TeriockJournalEntrySheet}
   */
  static async #onUpdateRulebook() {
    if (!game.teriock.checkEditable(this)) { return; }
    await RulebookUpdater.create({
      document: this.document,
      paths: ["flags.teriock.ruleType", "flags.teriock.ruleIcon", "flags.core.viewMode"],
      window: {
        icon: makeIconClass(TERIOCK.DISPLAY.icons.manifest.document.core, "title"),
        title: "TERIOCK.SHEETS.Journal.rulebook.title",
      },
    });
  }

  /** @inheritDoc */
  static DEFAULT_OPTIONS = {
    actions: { updateRulebook: this.#onUpdateRulebook },
    window: {
      controls: [{
        action: "updateRulebook",
        icon: makeIconClass(TERIOCK.DISPLAY.icons.manifest.document.core, "contextMenu"),
        label: "TERIOCK.SHEETS.Journal.rulebook.title",
        ownership: "OWNER",
        visible() {
          return this.isEditable && game.settings.get("teriock", "developerMode");
        },
      }],
      icon: makeIconClass(CONFIG.JournalEntry.sidebarIcon, "title"),
    },
  };

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
      icon: makeIconClass(TERIOCK.DISPLAY.icons.manifest.ui.wiki, "contextMenu"),
      label: _loc("TERIOCK.SYSTEMS.Common.MENU.viewOnWiki"),
      onClick: (_ev, li) => this.#getPage(li)?.system?.wikiOpen(),
      visible: li => this.#getPage(li)?.system?.isOnWiki,
    }];
  }

  /** @inheritDoc */
  isPageVisible(page) {
    return super.isPageVisible(page) && !page.isHidden;
  }
}
