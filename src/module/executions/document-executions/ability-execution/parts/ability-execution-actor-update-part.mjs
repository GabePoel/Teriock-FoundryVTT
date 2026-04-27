import { costConfig } from "../../../../constants/config/cost-config.mjs";
import { impactConfig } from "../../../../constants/config/impact-config.mjs";
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
       * Costs that are being paid.
       * @returns {string[]}
       */
      get #paidCosts() {
        return Object.keys(costConfig.primary.keys).filter(
          (c) => this.costs[c] > 0 && !this.options[`no${toTitleCase(c)}`],
        );
      }

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
          for (const c of this.#paidCosts) {
            const config = costConfig.primary.keys[c];
            if (config?.barStat) {
              this.updates[`system.${c}.value`] = Math.max(
                this.actor.system[c].value +
                  (config?.multiplier ?? 1) * this.costs[c],
                this.actor.system[c].min ?? 0,
              );
            }
          }
        }
      }

      /** @inheritDoc */
      async _updateActor() {
        if (
          this.actor &&
          this.payCosts &&
          game.teriock.getSetting("autoPayAbilityCosts")
        ) {
          for (const c of this.#paidCosts) {
            const config = costConfig.primary.keys[c];
            if (!config?.barStat) {
              await impactConfig[config?.impact]?.apply(
                this.actor,
                this.costs[c],
              );
            }
          }
          if (Object.keys(this.updates).length > 0) {
            this.actor.update(this.updates);
          }
        }
      }
    }
  );
}
