import { omit } from "../../../utils/object.mjs";
import DependeeSheet from "./dependee-sheet.mjs";

/**
 * Condition sheet.
 * @extends {DependeeSheet}
 * @property {TeriockActiveEffect<"condition">} document
 */
export default class ConditionSheet extends DependeeSheet {
  /** @type {Record<string, HandlebarsTemplatePart & Teriock.Sheet._TemplatePart>} */
  static PARTS = omit(super.PARTS, ["duration"]);

  /** @type {Record<string, Partial<ApplicationTabsConfiguration>>} */
  static TABS = {
    ...super.TABS,
    sheet: { ...super.TABS.sheet, tabs: super.TABS.sheet.tabs.filter(t => t.id !== "duration") },
  };

  /** @inheritDoc */
  _canRender(options) {
    // Prevent normal sheet rendering for known conditions.
    return !(this.document.isStatus && game.settings.get("teriock", "openConditionsAsJournalEntryPages"))
      && super._canRender(options);
  }

  /** @inheritDoc */
  _replaceHTML(result, content, options) {
    result.details.querySelectorAll(".form-group:has([name='disabled'])").forEach(el => el.remove());
    super._replaceHTML(result, content, options);
  }

  /** @inheritDoc */
  async render(options) {
    // If this is a known condition, open its journal entry instead of its sheet. Information is displayed more nicely.
    if (this.document.isStatus && game.settings.get("teriock", "openConditionsAsJournalEntryPages")) {
      const journal = await fromUuid(TERIOCK.CONST.CONDITIONS_JOURNAL_UUID);
      const page = journal?.pages.find((p) => p.system.slug === this.document.system.slug);
      if (journal && page) {
        await journal.sheet.render(true);
        journal.sheet.goToPage(page.id);
      }
    }
    return super.render(options);
  }
}
