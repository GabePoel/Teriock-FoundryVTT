import { impactOptions } from "../../constants/options/impact-options.mjs";
import BaseRoll from "./base-roll.mjs";

/**
 * @property {Teriock.Keys.Impact} impact
 */
export default class ImpactRoll extends BaseRoll {
  /**
   * @param {Teriock.System.FormulaString} formula
   * @param {object} data
   * @param {Teriock.Dice.ImpactRollOptions} options
   */
  constructor(formula, data, options = {}) {
    super(formula, data, options);
    this.impact = options.impact;
    if (this.impact && this.impact !== "other") {
      this.options.flavor ??= game.i18n.format("TERIOCK.ROLLS.Base.name", {
        value: impactOptions[this.impact]?.label,
      });
    }
  }

  /** @inheritDoc */
  async getActivations() {
    if (this.impact && this.impact !== "other") {
      return [
        new teriock.data.pseudoDocuments.activations.TakeActivation({
          impact: this.impact,
          amount: this.total,
        }),
      ];
    }
    return [];
  }
}
