import { BaseRoll } from "../../../../dice/rolls/_module.mjs";
import { FormulaField } from "../../../fields/_module.mjs";
import { rollableFormulaField } from "../../../fields/helpers/builders.mjs";
import BaseAutomation from "./base-automation.mjs";

export default class ThresholdAutomation extends BaseAutomation {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AUTOMATIONS.Threshold"];

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      bonus: rollableFormulaField(),
      threshold: new FormulaField({ initial: null, nullable: true }),
    });
  }

  /** @inheritDoc */
  get _formPaths() {
    return [...super._formPaths, "bonus", "threshold"];
  }

  /**
   * Get the display data given some threshold.
   * @param {number|null} threshold
   * @returns {{tooltip: string|null}}
   */
  getDisplayData(threshold) {
    return { tooltip: typeof threshold === "number" ? _loc("TERIOCK.ROLLS.Feat.dc", { threshold }) : null };
  }

  /**
   * Get a threshold number.
   * @param {object} rollData
   * @returns {Promise<number|null>}
   */
  async getThreshold(rollData) {
    if (this.threshold) { return BaseRoll.getValue(this.threshold, rollData); }
    return null;
  }
}
