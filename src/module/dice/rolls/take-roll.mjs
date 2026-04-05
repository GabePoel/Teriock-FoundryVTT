import { takeOptions } from "../../constants/options/take-options.mjs";
import BaseRoll from "./base-roll.mjs";

/**
 * @property {Teriock.Keys.RollImpact} take
 */
export default class TakeRoll extends BaseRoll {
  /**
   * @param {Teriock.System.FormulaString} formula
   * @param {object} data
   * @param {Teriock.Dice.TakeRollOptions} options
   */
  constructor(formula, data, options = {}) {
    super(formula, data, options);
    this.take = options.take;
    this.options.flavor =
      this.options.flavor ?? `${takeOptions[this.take].label} Roll`;
  }

  /** @inheritDoc */
  async getActivations() {
    return [
      new teriock.data.pseudoDocuments.activations.TakeActivation({
        take: this.take,
        amount: this.total,
      }),
    ];
  }
}
