import * as executionMixins from "../_module.mjs";
import { addFormula } from "../../../helpers/formula.mjs";

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
    class TradecraftExecution extends executionMixins.ThresholdExecutionMixin(Base) {
      /**
       * @param {Teriock.Execution.TradecraftExecutionOptions} options
       */
      constructor(options = /** @type {Teriock.Execution.TradecraftExecutionOptions} */ {}) {
        super(options);
        if (this.actor) { this.bonus = addFormula(this.actor.system.tradecrafts[this.tradecraft].formula, this.bonus); }
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
        return _loc("TERIOCK.ROLLS.Tradecraft.name", { value: TERIOCK.reference.tradecrafts[this.tradecraft] });
      }

      /** @inheritDoc */
      get icon() {
        return super.icon ?? TERIOCK.display.icons.tradecraft[this.tradecraft];
      }

      /** @inheritDoc */
      get journalEntryPageIdentifier() {
        return `tradecraft:${this.tradecraft}`;
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
