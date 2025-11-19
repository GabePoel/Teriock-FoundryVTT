import { addFormula } from "../../../helpers/formula.mjs";
import { formulaExists } from "../../../helpers/string.mjs";

/**
 * Mixin for executions involving a d20 roll.
 * @param {typeof BaseExecution} Base
 * @constructor
 */
export default function ThresholdExecutionMixin(Base) {
  /**
   * @extends {BaseExecution}
   * @mixin
   */
  return class ThresholdExecution extends Base {
    /**
     * @param {Teriock.Execution.ThresholdExecutionOptions} options
     */
    constructor(options = {}) {
      super(options);
      const {
        threshold,
        advantage = false,
        disadvantage = false,
        formula = "1d20",
        bonus = "",
        comparison = "gte",
      } = options;
      this.threshold = threshold;
      this.advantage = advantage;
      this.formula = formula;
      this.disadvantage = disadvantage;
      this.bonus = `${bonus}`;
      this.comparison = comparison;
    }

    /** @inheritDoc */
    get rollOptions() {
      return {
        flavor: this.flavor,
        threshold: this.threshold,
        comparison: this.comparison,
      };
    }

    /**
     * Prepare an underlying core formula.
     * @returns {Promise<void>}
     * @private
     */
    async _prepareBaseFormula() {
      if (this.advantage && !this.disadvantage) {
        this.formula = "2d20kh1";
      } else if (this.disadvantage && !this.advantage) {
        this.formula = "2d20kl1";
      }
    }

    /** @inheritDoc */
    async _prepareFormula() {
      await this._prepareBaseFormula();
      await super._prepareFormula();
      if (formulaExists(this.bonus)) {
        this.formula = addFormula(this.formula, this.bonus);
      }
    }
  };
}
