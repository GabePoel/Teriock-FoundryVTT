import { BaseDocumentMixin } from "../mixins/_module.mjs";

const { Combat } = foundry.documents;

/**
 * The Teriock Combat implementation.
 * @implements {Teriock.Documents.CombatInterface}
 * @extends {ClientDocument}
 * @extends {Combat}
 * @mixes BaseDocument
 * @property {DocumentCollection<TeriockCombatant>} combatants
 */
export default class TeriockCombat extends BaseDocumentMixin(Combat) {
  /**
   * Check if the effect might expire and send a dialog to some {@link TeriockUser}.
   * @param {TeriockConsequence} effect - Effect to check expiration for.
   * @param {"turn"|"combat"|"action"} trigger - What might trigger this effect to expire.
   * @param {"start"|"end"} time - When this effect might expire.
   * @param {UUID<TeriockActor>|null} actorUuid - UUID of some {@link TeriockActor} to compare against.
   * @param {object[]} [ops] - Optional array to mutate with additional updates.
   */
  #checkExpiration(effect, trigger, time, actorUuid, ops = []) {
    const expiration = effect.system.expirations.combat;
    if (expiration.what.type === "none" || !effect.active) return;
    if (
      expiration.when.trigger === trigger
      && expiration.when.time === time
      && (expiration.who.type === "everyone"
        || (expiration.who.type === "executor" && actorUuid === expiration.who.source)
        || (expiration.who.type === "target" && actorUuid === effect.actor.uuid))
    ) {
      if (expiration.when.skip <= 0 && effect.actor)
        effect.actor.defaultUser?.query("teriock.inCombatExpiration", { uuid: effect.uuid });
      else if (expiration.when.skip > 0) {
        ops.push({
          action: "update",
          docData: { "system.expirations.combat.when.skip": expiration.when.skip - 1 },
          uuid: effect.uuid,
        });
      }
    }
  }

  /**
   * Call a trigger on the provided actor.
   * @param {TeriockActor} actor
   * @param {Teriock.System.Trigger} trigger
   */
  #fireTrigger(actor, trigger) {
    actor?.defaultUser?.query("teriock.fireTrigger", { trigger, uuid: actor.uuid });
  }

  /**
   * Give an actor its reaction back.
   * @param {TeriockActor} actor
   */
  #regainReaction(actor) {
    actor.update({ "system.combat.hasReaction": true }, { asGM: true });
  }

  /**
   * Reset every actor's attack penalty.
   */
  #resetAttackPenalties() {
    game.users.queryGM("teriock.turnChange", {
      actorUuids: this.actors.filter(a => a.system.combat.attackPenalty !== 0).map(a => a.uuid),
    }, { failPrefix: "TERIOCK.SYSTEMS.Combat.QUERY.resetAttackPenalties.failPrefix", localize: true });
  }

  /**
   * @param {TeriockActor} effectActor
   * @param {TeriockActor} timeActor
   * @param {"turn"|"combat"|"action"} trigger
   * @param {"start"|"end"} time
   */
  #tryExpirations(effectActor, timeActor, trigger, time) {
    const ops = [];
    const mightExpire = [];
    if (effectActor) {
      mightExpire.push(...effectActor.consequences);
      mightExpire.push(...effectActor.imbuements);
    }
    for (const effect of mightExpire) this.#checkExpiration(effect, trigger, time, timeActor?.uuid, ops);
    if (ops.length === 0) return;
    game.users.queryGM("teriock.massWrite", { operations: ops }, {
      failPrefix: "TERIOCK.SYSTEMS.Combat.QUERY.tryAllEffectExpirations.failPrefix",
      localize: true,
    });
  }

  /**
   * The current acting actor.
   * @returns {AnyActor|null}
   */
  get actor() {
    return this.combatant ? this.combatant.actor || null : null;
  }

  /**
   * The actors in this combat.
   * @returns {AnyActor[]}
   */
  get actors() {
    return Array.from(this.combatants.filter(c => c.actor).map(c => c.actor));
  }

  /** @inheritDoc */
  async endCombat() {
    const out = await super.endCombat();
    this.#resetAttackPenalties();
    for (const actor of this.actors) {
      this.#tryExpirations(actor, actor, "combat", "end");
      this.#fireTrigger(actor, "combatEnd");
      this.#regainReaction(actor);
    }
    return out;
  }

  /** @inheritDoc */
  async nextTurn() {
    const previousActor = this.actor;
    const out = await super.nextTurn();
    if (previousActor) {
      for (const actor of this.actors) this.#tryExpirations(actor, previousActor, "turn", "end");
    }
    this.#resetAttackPenalties();
    this.updateCombatantActors();
    this.#fireTrigger(previousActor, "turnEnd");
    const newActor = this.actor;
    if (newActor) {
      this.#regainReaction(newActor);
      for (const actor of this.actors) {
        this.#tryExpirations(actor, newActor, "action", "start");
        this.#tryExpirations(actor, newActor, "turn", "start");
      }
      this.#fireTrigger(newActor, "turnStart");
    }
    return out;
  }

  /** @inheritDoc */
  async startCombat() {
    const out = await super.startCombat();
    this.#resetAttackPenalties();
    for (const actor of this.actors) {
      this.#tryExpirations(actor, actor, "combat", "start");
      this.#fireTrigger(actor, "combatStart");
    }
    return out;
  }
}
