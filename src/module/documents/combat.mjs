import { selectUser } from "../helpers/utils.mjs";
import { BaseTeriockCombat } from "./_base.mjs";

export default class TeriockCombat extends BaseTeriockCombat {
  /**
   * Check if the effect might expire and send a dialog to some {@link TeriockUser}.
   *
   * @param {TeriockConsequence} effect - Effect to check expiration for.
   * @param {"turn"|"combat"|"action"} trigger - What might trigger this effect to expire.
   * @param {"start"|"end"} time - When this effect might expire.
   * @param {Teriock.UUID<TeriockActor>|null} actorUuid - UUID of some {@link TeriockActor} to compare against.
   * @param {object[]} [updates] - Optional array to mutate with additional updates.
   * @returns {Promise<void>}
   * @private
   */
  async _confirmEffectExpiration(
    effect,
    trigger,
    time,
    actorUuid,
    updates = [],
  ) {
    if (
      effect.system.expirations.combat.what.type !== "none" &&
      effect.system.expirations.combat.when.trigger === trigger &&
      effect.system.expirations.combat.when.time === time &&
      (effect.system.expirations.combat.who.type === "everyone" ||
        (effect.system.expirations.combat.who.type === "executor" &&
          actorUuid === effect.system.expirations.combat.who.source) ||
        (effect.system.expirations.combat.who.type === "target" &&
          actorUuid === effect.actor.uuid))
    ) {
      const user = selectUser(effect.actor);
      if (effect.system.expirations.combat.when.skip <= 0 && user) {
        await user.query("teriock.inCombatExpiration", {
          effectUuid: effect.uuid,
        });
      } else if (effect.system.expirations.combat.when.skip > 0) {
        updates.push({
          _id: effect.id,
          "system.expirations.combat.when.skip":
            effect.system.expirations.combat.when.skip - 1,
        });
      }
    }
  }

  /**
   *
   * @param {TeriockActor} effectActor
   * @param {TeriockActor} timeActor
   * @param {"turn"|"combat"|"action"} trigger
   * @param {"start"|"end"} time
   * @returns {Promise<void>}
   * @private
   */
  async _tryAllEffectExpirations(effectActor, timeActor, trigger, time) {
    const updates = [];
    for (const effect of effectActor.consequences) {
      await this._confirmEffectExpiration(
        effect,
        trigger,
        time,
        timeActor?.uuid,
        updates,
      );
    }
    if (updates.length > 0) {
      await effectActor.updateEmbeddedDocuments("ActiveEffect", updates);
    }
  }

  /** @inheritDoc */
  async nextTurn() {
    // End of turn
    /** @type {TeriockActor} */
    const previousActor = this.combatant?.actor;
    for (const actor of this.combatants.map(
      (combatant) => /** @type {TeriockActor} */ combatant.actor,
    )) {
      await this._tryAllEffectExpirations(actor, previousActor, "turn", "end");
    }

    // Turn change
    const out = await super.nextTurn();
    for (const actor of this.combatants.map(
      (combatant) => /** @type {TeriockActor} */ combatant.actor,
    )) {
      if (actor.system.attackPenalty !== 0)
        await actor.update({ "system.attackPenalty": 0 });
    }
    this.updateCombatantActors();

    // Start of turn
    /** @type {TeriockActor} */
    const newActor = this.combatant?.actor;
    for (const actor of this.combatants.map(
      (combatant) => /** @type {TeriockActor} */ combatant.actor,
    )) {
      await this._tryAllEffectExpirations(actor, newActor, "action", "start");
      await this._tryAllEffectExpirations(actor, newActor, "turn", "start");
    }

    // Finish
    return out;
  }

  /** @inheritDoc */
  async startCombat() {
    let out = await super.startCombat();
    for (const actor of this.combatants.map(
      (combatant) => /** @type {TeriockActor} */ combatant.actor,
    )) {
      await this._tryAllEffectExpirations(actor, actor, "combat", "start");
    }
    return out;
  }

  /** @inheritDoc */
  async endCombat() {
    let out = await super.endCombat();
    for (const actor of this.combatants.map(
      (combatant) => /** @type {TeriockActor} */ combatant.actor,
    )) {
      await this._tryAllEffectExpirations(actor, actor, "combat", "end");
    }
    return out;
  }

  /** @inheritDoc */
  async nextRound() {
    let out = await super.nextRound();
    await game.time.advance(5);
    return out;
  }

  /** @inheritDoc */
  async previousRound() {
    let out = await super.previousRound();
    await game.time.advance(-5);
    return out;
  }
}
