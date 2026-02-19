import { takeOptions } from "../../constants/options/take-options.mjs";
import BaseRoll from "./base-roll.mjs";

/**
 * @property {Teriock.Parameters.Consequence.RollConsequenceKey} take
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
  async getButtons() {
    return [
      teriock.helpers.interaction.buttonHandlers[
        "take-rollable-take"
      ].buildButton(this.take, this.total),
    ];
  }
}
