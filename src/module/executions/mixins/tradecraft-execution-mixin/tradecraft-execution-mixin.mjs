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
        if (this.threshold !== undefined) {
          return game.i18n.format("TERIOCK.ROLLS.Tradecraft.thresholded", {
            threshold: this.threshold,
            value: TERIOCK.reference.tradecrafts[this.tradecraft],
          });
        }
        return game.i18n.format("TERIOCK.ROLLS.Tradecraft.name", {
          value: this.tradecraft,
        });
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
