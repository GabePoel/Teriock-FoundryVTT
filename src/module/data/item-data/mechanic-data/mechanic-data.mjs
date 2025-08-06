import TeriockBaseItemData from "../base-item-data/base-item-data.mjs";

/**
 * Effect that handles automatic synchronous effect handling of a {@link TeriockActor}.
 */
export default class TeriockMechanicData extends TeriockBaseItemData {
  static metadata = Object.freeze({
    consumable: false,
    namespace: "",
    pageNameKey: "name",
    type: "mechanic",
    usable: false,
    wiki: false,
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
    if (!effect) return false;
    if (this.actor) {
      const hpUnconscious = this.actor.system.hp.value < 1;
      const hpDead = this.actor.system.hp.value === this.actor.system.hp.min;
      const mpUnconscious = this.actor.system.mp.value < 1;
      const mpDead = this.actor.system.mp.value === this.actor.system.mp.min;
      const unconsciousResistant =
        this.actor.system.resistances.statuses.has("unconscious");
      const unconsciousImmune =
        this.actor.system.immunities.statuses.has("unconscious");
      const deadResistant = this.actor.system.resistances.statuses.has("dead");
      const deadImmune = this.actor.system.immunities.statuses.has("dead");
      const downResistant = this.actor.system.resistances.statuses.has("down");
      const downImmune = this.actor.system.immunities.statuses.has("down");
      if (effect.name === "Zero HP/MP") {
        return !(
          (hpUnconscious || mpUnconscious) &&
          !(hpDead || mpDead || this.actor.statuses.has("dead")) &&
          !(
            unconsciousResistant ||
            unconsciousImmune ||
            downResistant ||
            downImmune
          )
        );
      } else if (effect.name === "Negative HP/MP") {
        return !(
          (hpDead || mpDead) &&
          !(downResistant || deadImmune || deadResistant || downImmune)
        );
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
