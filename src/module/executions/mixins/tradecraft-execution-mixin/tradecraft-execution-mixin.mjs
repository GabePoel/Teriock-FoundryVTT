import { addFormula } from "../../../helpers/formula.mjs";
import ThresholdExecutionMixin from "../threshold-execution-mixin/threshold-execution-mixin.mjs";

/**
 * @param {typeof BaseExecution} Base
 */
export default function TradecraftExecutionMixin(Base) {
  return (
    /**
     * @extends {BaseExecution}
     * @mixes ThresholdExecution
     * @mixin
     */
    class TradecraftExecution extends ThresholdExecutionMixin(Base) {
      /**
       * @param {Teriock.Execution.TradecraftExecutionOptions} options
       */
      constructor(
        options = /** @type {Teriock.Execution.TradecraftExecutionOptions} */ {},
      ) {
        super(options);
        if (this.actor) {
          this.bonus = addFormula(
            this.actor.system.tradecrafts[this.tradecraft].formula,
            this.bonus,
          );
        }
      }

      /** @inheritDoc */
      get executionNames() {
        return [...super.executionNames, "Tradecraft"];
      }

      /** @inheritDoc */
      get flavor() {
        if (typeof this.threshold === "number") {
          return _loc("TERIOCK.ROLLS.Tradecraft.thresholded", {
            threshold: this.threshold,
            value: TERIOCK.reference.tradecrafts[this.tradecraft],
          });
        }
        return _loc("TERIOCK.ROLLS.Tradecraft.name", {
          value: TERIOCK.reference.tradecrafts[this.tradecraft],
        });
      }

      /**
       * Tradecraft this execution corresponds to.
       * @returns {Teriock.Keys.Tradecraft}
       * @abstract
       */
      get tradecraft() {
        return "artist";
      }
    }
  );
}
