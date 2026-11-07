import { IdentifierField } from "../../../data/fields/_module.mjs";
import { nullStringField } from "../../../data/fields/tools/builders.mjs";
import { makeIconClass } from "../../../utils/_module.mjs";
import BaseUpdater from "./base-updater.mjs";

/**
 * Dialog for updating rulebook flags.
 * @property {TeriockJournalEntry|TeriockJournalEntryPage} document
 */
export default class RulebookUpdater extends BaseUpdater {
  /** @inheritDoc */
  async _onRender(context, options) {
    await super._onRender(context, options);
    const icon = foundry.utils.getProperty(this._currentData, "flags.teriock.ruleIcon")
      || TERIOCK.DISPLAY.icons.manifest.document.core;
    if (this.window?.icon) { this.window.icon.className = `window-icon ${makeIconClass(icon, "title")}`; }
  }

  /** @inheritDoc */
  _prepareFieldContext(path) {
    const context = super._prepareFieldContext(path);
    if (path === "flags.teriock.ruleType") {
      context.field = new IdentifierField({
        hint: "TERIOCK.SHEETS.Journal.rulebook.ruleType.hint",
        label: "TERIOCK.SHEETS.Journal.rulebook.ruleType.label",
        placeholder: "rule",
      });
    } else if (path === "flags.teriock.ruleIcon") {
      context.field = nullStringField({
        hint: "TERIOCK.SHEETS.Journal.rulebook.ruleIcon.hint",
        label: "TERIOCK.SHEETS.Journal.rulebook.ruleIcon.label",
        placeholder: TERIOCK.DISPLAY.icons.manifest.document.core,
      });
    }
    return context;
  }
}
