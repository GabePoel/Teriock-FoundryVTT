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
      /** @inheritDoc */
      get flavor() {
        let flavor = "";
        if (this.threshold !== undefined) {
          flavor += `DC ${this.threshold}`;
        }
        flavor += ` ${TERIOCK.index.tradecrafts[this.tradecraft]} Check`;
        return flavor;
      }

      /**
       * Tradecraft this execution corresponds to.
       * @returns {Teriock.Parameters.Fluency.Tradecraft}
       * @abstract
       */
      get tradecraft() {
        return "artist";
      }

      /** @inheritDoc */
      async _prepareFormula() {
        await super._prepareFormula();
        if (this.actor) {
          const { extra } =
            this.actor.system.tradecrafts[this.tradecraft] || {};
          if (extra) {
            this.formula = addFormula(
              this.formula,
              `@tc.${this.tradecraft.slice(0, 3)}.kno`,
            );
          }
        }
      }
    }
  );
}
