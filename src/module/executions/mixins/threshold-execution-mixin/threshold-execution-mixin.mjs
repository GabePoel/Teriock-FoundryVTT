import { addFormula, formulaExists } from "../../../helpers/formula.mjs";

/**
 * Mixin for executions involving a d20 roll.
 * @param {typeof BaseExecution} Base
 */
export default function ThresholdExecutionMixin(Base) {
  return (
    /**
     * @extends {BaseExecution}
     * @mixin
     */
    class ThresholdExecution extends Base {
      /**
       * @param {Teriock.Execution.ThresholdExecutionOptions} options
       */
      constructor(options = {}) {
        super(options);
        const {
          threshold,
          formula = undefined,
          edge = 0,
          bonus = "",
          comparison = "gte",
        } = options;
        this.edge = edge;
        this.threshold = threshold;
        this.formula = formula;
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
       */
      async _prepareBaseFormula() {
        if (!this.formula) {
          let suffix = "";
          if (this.edge > 0) suffix = "kh1";
          if (this.edge < 0) suffix = "kl1";
          this.formula = `${1 + Math.abs(this.edge)}d20${suffix}`;
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
    }
  );
}
