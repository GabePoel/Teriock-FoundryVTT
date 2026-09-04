import { selectTradecraftDialog, selectTradecraftsDialog } from "../../../../applications/dialogs/_module.mjs";
import { mixClasses } from "../../../../helpers/construction.mjs";
import { tradecraftsField } from "../../../fields/tools/builders.mjs";
import { TradecraftActivation } from "../../activations/command-activations.mjs";
import { CritMechanicMixin, OverrideCompetencePseudoDocumentMixin } from "../../mixins/_module.mjs";
import { ThresholdAutomation } from "../abstract/_module.mjs";
import * as automationMixins from "../mixins/_module.mjs";

const { fields } = foundry.data;

/**
 * @mixes CritMechanic
 * @mixes TriggerAutomation
 * @mixes OverrideCompetenceMechanic
 */
export default class TradecraftAutomation
  extends mixClasses(
    ThresholdAutomation,
    CritMechanicMixin,
    automationMixins.TriggerAutomationMixin,
    OverrideCompetencePseudoDocumentMixin,
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
    return Object.assign(super.defineSchema(), {
      all: new fields.BooleanField({ initial: false }),
      automatic: new fields.BooleanField({ initial: true }),
      multi: new fields.BooleanField(),
      tradecrafts: tradecraftsField(),
    });
  }

  /** @inheritDoc */
  get _formPaths() {
    return [
      "tradecrafts",
      "hr",
      ...this._selectionPaths,
      "hr",
      ...this._triggerPaths,
      "hr",
      "bonus",
      "threshold",
      ...this._competencePaths,
    ];
  }

  /**
   * Paths relating to how tradecrafts get selected.
   * @returns {string[]}
   */
  get _selectionPaths() {
    const paths = ["multi"];
    if (this.multi) { paths.push("all"); }
    if (!this.multi || !this.all) { paths.push("automatic"); }
    return paths;
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
