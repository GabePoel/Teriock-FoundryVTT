import { TeriockRoll } from "../../../../dice/_module.mjs";
import { formulaExists } from "../../../../helpers/utils.mjs";

/**
 * @param {typeof AbilityExecutionConstructor} Base
 * @constructor
 */
export default function AbilityExecutionActorUpdatePart(Base) {
  /**
   * @mixin
   */
  return class AbilityExecutionActorUpdate extends Base {
    /**
     * Prepare attack penalty.
     * @returns {Promise<void>}
     * @private
     */
    async _prepareAttackPenalty() {
      if (
        this.source.system.interaction === "attack" &&
        formulaExists(this.attackPenaltyFormula)
      ) {
        const attackPenaltyRoll = new TeriockRoll(
          this.attackPenaltyFormula,
          this.rollData,
        );
        await attackPenaltyRoll.evaluate();
        this.attackPenalty = attackPenaltyRoll.total;
      } else {
        this.attackPenalty = 0;
      }
    }

    /** @inheritDoc */
    async _prepareUpdates() {
      await this._prepareAttackPenalty();
      if (this.actor) {
        if (this.source.system.interaction === "attack") {
          this.updates["system.combat.attackPenalty"] =
            this.actor.system.combat.attackPenalty + this.attackPenalty;
        }
        if (
          this.source.system.maneuver === "reactive" &&
          this.source.system.executionTime === "r1"
        ) {
          this.updates["system.combat.hasReaction"] = false;
        }
        for (const stat of ["hp", "mp"]) {
          if (this.costs[stat] > 0) {
            this.updates[`system.${stat}.value`] = Math.max(
              this.actor.system[stat].value - this.costs[stat],
              this.actor.system[stat].min ?? 0,
            );
          }
        }
      }
    }

    /** @inheritDoc */
    async _updateActor() {
      if (
        this.actor &&
        game.settings.get("teriock", "automaticallyPayAbilityCosts")
      ) {
        if (this.costs.gp > 0) {
          await this.actor.system.takePay(this.costs.gp);
        }
        await this.actor.update(this.updates);
      }
    }
  };
}
