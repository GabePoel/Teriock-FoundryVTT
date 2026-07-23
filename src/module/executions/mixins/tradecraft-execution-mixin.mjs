import { addFormula } from "../../helpers/formula.mjs";
import * as executionMixins from "./_module.mjs";

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
       * @param {object} [data]
       * @param {Teriock.Execution.ThresholdExecutionOptions} [options]
       */
      constructor(data = {}, options = {}) {
        super(data, options);
        if (this.actor) {
          this.updateSource({ bonus: addFormula(this.actor.system.tradecrafts[this.tradecraft].bonus, this.bonus) });
        }
        if (game.settings.get("teriock", "secretTradecrafts").has(this.tradecraft)) {
          this._messageMode = options.messageMode ?? "blind";
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
            value: TERIOCK.config.tradecraft.tradecrafts[this.tradecraft].label,
          });
        }
        return _loc("TERIOCK.ROLLS.Tradecraft.name", {
          value: TERIOCK.config.tradecraft.tradecrafts[this.tradecraft].label,
        });
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
