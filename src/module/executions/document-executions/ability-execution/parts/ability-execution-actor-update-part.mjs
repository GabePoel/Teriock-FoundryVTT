import { BaseRoll } from "../../../../dice/rolls/_module.mjs";
import { formulaExists } from "../../../../helpers/formula.mjs";
import { toTitleCase } from "../../../../helpers/string.mjs";

/**
 * @param {typeof AbilityExecutionConstructor} Base
 */
export default function AbilityExecutionActorUpdatePart(Base) {
  return (
    /**
     * @extends {AbilityExecutionConstructor}
     * @mixin
     */
    class AbilityExecutionActorUpdate extends Base {
      /**
       * Prepare attack penalty.
       * @returns {Promise<void>}
       */
      async _prepareAttackPenalty() {
        if (this.isAttack && formulaExists(this.incurredAttackPenalty)) {
          this.attackPenalty = await BaseRoll.getValue(
            this.incurredAttackPenalty,
            this.rollData,
          );
        } else {
          this.attackPenalty = 0;
        }
      }

      /** @inheritDoc */
      async _prepareUpdates() {
        await this._prepareAttackPenalty();
        if (this.actor) {
          if (this.isAttack) {
            this.updates["system.combat.attackPenalty"] =
              this.actor.system.combat.attackPenalty + this.attackPenalty;
          }
          if (this.usesReaction) {
            this.updates["system.combat.hasReaction"] = false;
          }
          for (const stat of ["hp", "mp"]) {
            if (
              this.costs[stat] > 0 &&
              !this.options[`no${toTitleCase(stat)}`]
            ) {
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
          this.actor.getSetting("automaticallyPayAbilityCosts") &&
          game.teriock.getSetting("automaticallyPayAbilityCosts")
        ) {
          if (this.costs.gp > 0 && !this.options.noGp) {
            await this.actor.system.takePay(this.costs.gp);
          }
          if (Object.keys(this.updates).length > 0) {
            await this.actor.update(this.updates);
          }
        }
      }
    }
  );
}
