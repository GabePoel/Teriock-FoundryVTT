import { IdentifierField } from "../../../data/fields/_module.mjs";
import { nullStringField } from "../../../data/fields/tools/builders.mjs";
import { makeIconClass } from "../../../utils/_module.mjs";
import BaseUpdater from "./base-updater.mjs";

const { BooleanField, NumberField } = foundry.data.fields;
const { JournalEntrySheet } = foundry.applications.sheets.journal;

/**
 * Dialog for updating rulebook flags.
 * @property {TeriockJournalEntry|TeriockJournalEntryPage} document
 */
export default class RulebookUpdater extends BaseUpdater {
  /** @inheritDoc */
  async _onRender(context, options) {
    await super._onRender(context, options);
    const icon = foundry.utils.getProperty(this._currentData, "flags.teriock.ruleIcon")
      || this.document.parent?.getFlag("teriock", "ruleIcon") || TERIOCK.DISPLAY.icons.manifest.document.core;
    if (this.window?.icon) { this.window.icon.className = `window-icon ${makeIconClass(icon, "title")}`; }
  }

  /** @inheritDoc */
  _prepareFieldContext(path) {
    const context = super._prepareFieldContext(path);
    if (path === "flags.teriock.ruleType") {
      context.field = new IdentifierField({
        hint: "TERIOCK.SHEETS.Journal.rulebook.ruleType.hint",
        label: "TERIOCK.SHEETS.Journal.rulebook.ruleType.label",
        placeholder: this.document.parent?.getFlag("teriock", "ruleType") ?? "rule",
      });
    } else if (path === "flags.teriock.ruleIcon") {
      context.field = nullStringField({
        hint: "TERIOCK.SHEETS.Journal.rulebook.ruleIcon.hint",
        label: "TERIOCK.SHEETS.Journal.rulebook.ruleIcon.label",
        placeholder: this.document.parent?.getFlag("teriock", "ruleIcon")
          ?? TERIOCK.DISPLAY.icons.manifest.document.core,
      });
    } else if (path === "flags.teriock.hiddenSubpage") {
      context.field = new BooleanField({
        hint: "TERIOCK.SHEETS.Journal.rulebook.hiddenSubpage.hint",
        label: "TERIOCK.SHEETS.Journal.rulebook.hiddenSubpage.label",
      });
    } else if (path === "flags.core.viewMode") {
      const { MULTIPLE, SINGLE } = JournalEntrySheet.VIEW_MODES;
      context.field = new NumberField({
        choices: { [MULTIPLE]: "JOURNAL.ModeMultiple", [SINGLE]: "JOURNAL.ModeSingle" },
        hint: "TERIOCK.SHEETS.Journal.rulebook.viewMode.hint",
        label: "TERIOCK.SHEETS.Journal.rulebook.viewMode.label",
      });
    }
    return context;
  }
}
