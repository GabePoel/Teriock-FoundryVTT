import { BaseSheetMixin } from "../mixins/_module.mjs";

const { ActiveEffectConfig } = foundry.applications.sheets;

/**
 * {@link TeriockCondition} sheet.
 * @extends {ActiveEffectConfig}
 * @mixes BaseSheet
 * @property {TeriockCondition} document
 */
export default class ConditionSheet extends BaseSheetMixin(ActiveEffectConfig) {
  /** @inheritDoc */
  _canRender(options) {
    return !this.document.isStatus && super._canRender(options);
  }

  /** @inheritDoc */
  async render(options) {
    if (this.document.isStatus) {
      const journal = await fromUuid("Compendium.teriock.rules.JournalEntry.condition0000000");
      const page = journal?.pages.find((p) => p.system.identifier === this.document.system.identifier);
      if (journal && page) {
        await journal.sheet.render(true);
        journal.sheet.goToPage(page.id);
      }
    }
    return super.render(options);
  }
}
