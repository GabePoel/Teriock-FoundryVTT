import { mixClasses } from "../../helpers/construction.mjs";
import { addFormula } from "../../helpers/formula.mjs";
import { ThresholdExecutionMixin } from "./_module.mjs";

/**
 * @import BaseExecution from "../abstract/base-execution/base-execution.mjs";
 */

/**
 * @template {MixinBase<typeof BaseExecution>} T
 * @param {T} Base
 */
export default function TradecraftExecutionMixin(Base) {
  /**
   * @mixes ThresholdExecution
   * @mixin
   */
  class TradecraftExecution extends mixClasses(Base, ThresholdExecutionMixin) {
    /** @inheritDoc */
    get chatData() {
      return foundry.utils.mergeObject(super.chatData, {
        system: { restrictVisibility: !game.settings.get("teriock", "showPrivateTradecraftDiceRolls") },
      });
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
      return super.icon ?? TERIOCK.display.icons.manifest.tradecraft[this.tradecraft];
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

    /**
     * @inheritDoc
     * @param {Teriock.Execution.ConstructionOptions<Teriock.Execution.ThresholdExecutionOptions>} [options]
     */
    _configure(options = {}) {
      super._configure(options);
      if (this.actor) {
        this._source.bonus = addFormula(this.actor.system.tradecrafts[this.tradecraft].bonus, this._source.bonus);
      }
      if (game.settings.get("teriock", "secretTradecrafts").has(this.tradecraft)) {
        this._messageMode = options.messageMode ?? "blind";
      }
    }
  }

  return TradecraftExecution;
}
