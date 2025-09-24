import { mergeFreeze } from "../../../helpers/utils.mjs";
import TeriockBaseItemModel from "../base-item-data/base-item-data.mjs";

/**
 * Effect that handles automatic synchronous effect handling of a {@link TeriockActor}.
 */
export default class TeriockMechanicModel extends TeriockBaseItemModel {
  /** @inheritDoc */
  static metadata = mergeFreeze(super.metadata, {
    type: "mechanic",
  });

  /** @inheritDoc */
  prepareDerivedData() {
    super.prepareDerivedData();
    if (this.actor) {
      if (this.actor.system.encumbranceLevel > 0) {
        this.actor.statuses.add("encumbered");
      }
      if (
        this.actor.statuses.has("ethereal") &&
        this.actor.statuses.has("unconscious")
      ) {
        this.actor.statuses.delete("unconscious");
        this.actor.statuses.delete("asleep");
        this.actor.statuses.add("dead");
      }
    }
  }

  /** @inheritDoc */
  shouldSuppress(id) {
    const effect = this.parent.effects?.get(id);
    if (!effect) {
      return false;
    }
    if (this.actor) {
      const hpUnconscious = this.actor.system.hp.value < 1;
      const hpCriticallyWounded =
        this.actor.system.hp.value ===
        (this.actor.system.hp.min < 0 ? this.actor.system.hp.min + 1 : 0);
      const hpDead = this.actor.system.hp.value === this.actor.system.hp.min;
      const mpUnconscious = this.actor.system.mp.value < 1;
      const mpCriticallyWounded =
        this.actor.system.mp.value ===
        (this.actor.system.mp.min < 0 ? this.actor.system.mp.min + 1 : 0);
      const mpDead = this.actor.system.mp.value === this.actor.system.mp.min;
      const unconsciousProtected = conditionProtected(
        this.actor,
        "unconscious",
      );
      const criticallyWoundedProtected = conditionProtected(
        this.actor,
        "criticallyWounded",
      );
      const deadProtected = conditionProtected(this.actor, "dead");
      const downProtected = conditionProtected(this.actor, "down");
      if (effect.name === "Zero HP/MP") {
        return !(
          (hpUnconscious || mpUnconscious) &&
          !(
            hpCriticallyWounded ||
            mpCriticallyWounded ||
            this.actor.statuses.has("criticallyWounded") ||
            hpDead ||
            mpDead ||
            this.actor.statuses.has("dead")
          ) &&
          !(unconsciousProtected || downProtected)
        );
      } else if (effect.name === "Critical HP/MP") {
        return !(
          (hpCriticallyWounded || mpCriticallyWounded) &&
          !(hpDead || mpDead || this.actor.statuses.has("dead")) &&
          !(criticallyWoundedProtected || downProtected)
        );
      } else if (effect.name === "Negative HP/MP") {
        return !((hpDead || mpDead) && !(deadProtected || downProtected));
      } else if (effect.name === "Lightly Encumbered") {
        return this.actor.system.encumbranceLevel !== 1;
      } else if (effect.name === "Heavily Encumbered") {
        return this.actor.system.encumbranceLevel !== 2;
      } else if (effect.name === "Overburdened") {
        return this.actor.system.encumbranceLevel !== 3;
      } else if (effect.name === "Down and Ethereal") {
        return !(
          this.actor.statuses.has("down") && this.actor.statuses.has("ethereal")
        );
      }
    }
    return false;
  }
}

/**
 * Check if there's a protection for the given condition.
 * @param {TeriockActor|null} actor
 * @param {Teriock.Parameters.Condition.ConditionKey} condition
 */
function conditionProtected(actor, condition) {
  let out = false;
  if (actor) {
    for (const protection of Object.values(actor.system.protections)) {
      if (protection.statuses.has(condition)) {
        out = true;
      }
    }
  }
  return out;
}
