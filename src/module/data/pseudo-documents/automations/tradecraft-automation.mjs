import { selectTradecraftDialog, selectTradecraftsDialog } from "../../../applications/dialogs/_module.mjs";
import { mixClasses } from "../../../helpers/construction.mjs";
import { tradecraftsField } from "../../fields/tools/builders.mjs";
import { migrateKey } from "../../migrations/source-migrations.mjs";
import { TradecraftActivation } from "../activations/command-activations.mjs";
import { CritMechanicMixin, OverrideCompetenceMechanicMixin } from "../mixins/_module.mjs";
import { ThresholdAutomation } from "./abstract/_module.mjs";
import * as automationMixins from "./mixins/_module.mjs";

/**
 * @extends {ThresholdAutomation}
 * @mixes CritMechanic
 * @mixes SelectAutomation
 * @mixes TriggerAutomation
 * @mixes OverrideCompetenceMechanic
 */
export default class TradecraftAutomation
  extends mixClasses(
    ThresholdAutomation,
    CritMechanicMixin,
    automationMixins.SelectAutomationMixin,
    automationMixins.TriggerAutomationMixin,
    OverrideCompetenceMechanicMixin,
  )
{
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AUTOMATIONS.Tradecraft"];

  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.COMMON.Tradecraft";
  }

  /** @inheritDoc */
  static get triggerMetadata() {
    return Object.assign(super.triggerMetadata, { executionTriggers: true });
  }

  /** @inheritDoc */
  static get TYPE() {
    return "tradecraft";
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), { tradecrafts: tradecraftsField() });
  }

  /** @inheritDoc */
  static migrateData(source, options, state) {
    migrateKey(source, "tradecraft", "tradecrafts", v => [v]);
    return super.migrateData(source, options, state);
  }

  /** @inheritDoc */
  get _formPaths() {
    return [
      "tradecrafts",
      "hr",
      ...this._selectionOptionPaths,
      "hr",
      ...this._triggerPaths,
      "hr",
      "bonus",
      "threshold",
      ...this._competencePaths,
    ];
  }

  /**
   * Select one or more configured tradecrafts.
   * Dialogs only open when an execution context is provided.
   * @param {object} [options]
   * @param {BaseExecution} [options.execution]
   * @returns {Promise<Teriock.Keys.Tradecraft[]>}
   */
  async _choose(options = {}) {
    const choices = Array.from(this.tradecrafts).filter(Boolean);
    if (choices.length === 0) { return []; }
    if (this.automatic && choices.length === 1) { return choices; }
    if (this.multi && this.all) { return choices; }
    if (!options.execution) { return choices; }
    if (this.multi) { return selectTradecraftsDialog(choices); }
    const chosen = await selectTradecraftDialog(choices);
    return chosen ? [chosen] : [];
  }

  /** @inheritDoc */
  async _getActivations(options = {}) {
    const selected = await this._choose(options);
    if (!selected.length) { return []; }
    const rollData = options.execution?.getRollData?.() ?? options.rollData ?? {};
    const threshold = await this.getThreshold(rollData);
    return selected.map(tradecraft =>
      new TradecraftActivation({
        display: this.getDisplayData(threshold),
        options: { bonus: this.bonus, competence: this.getCompetence(options), threshold, tradecraft },
      })
    );
  }
}
