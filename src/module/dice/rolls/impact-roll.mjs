import { impactOptions } from "../../constants/options/impact-options.mjs";
import BaseRoll from "./base-roll.mjs";

/**
 * @property {Teriock.Keys.Impact} impact
 */
export default class ImpactRoll extends BaseRoll {
  /**
   * @param {Teriock.System.FormulaString} formula
   * @param {object} data
   * @param {Partial<Teriock.Dice.ImpactRollOptions>} options
   */
  constructor(formula, data, options = {}) {
    super(formula, data, options);
    this.#setImpactFlavor();
  }

  /**
   * @inheritDoc
   * @returns {Teriock.Dice.ImpactRollOptions}
   */
  static get defaultOptions() {
    return Object.assign(super.defaultOptions, { impact: "other" });
  }

  /**
   * Whether this roll has an impact associated with it.
   * @returns {boolean}
   */
  get hasImpact() {
    return this.impact && this.impact !== "other";
  }

  /**
   * The impact associated with this roll.
   * @returns {Teriock.Keys.Impact}
   */
  get impact() {
    return this.options.impact;
  }

  /**
   * The impact associated with this roll.
   * @param impact
   */
  set impact(impact) {
    this.options.impact = impact;
    this.#setImpactFlavor();
  }

  /**
   * Set the flavor if there's not one already defined.
   */
  #setImpactFlavor() {
    if (this.hasImpact) {
      this.options.flavor ??= game.i18n.format("TERIOCK.ROLLS.Base.name", {
        value: impactOptions[this.impact]?.label,
      });
    }
  }

  /** @inheritDoc */
  async getActivations() {
    if (this.hasImpact) {
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
