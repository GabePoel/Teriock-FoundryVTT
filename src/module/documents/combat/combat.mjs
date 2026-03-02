import { BaseDocumentMixin } from "../mixins/_module.mjs";

const { Combat } = foundry.documents;

// noinspection JSClosureCompilerSyntax
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
   * The currently acting actor.
   * @returns {GenericActor|null}
   */
  get actor() {
    if (this.combatant) return this.combatant.actor || null;
    return null;
  }

  /**
   * The actors in this combat.
   * @returns {GenericActor[]}
   */
  get actors() {
    return Array.from(
      this.combatants.filter((c) => c.actor).map((c) => c.actor),
    );
  }

  /**
   * Call a pseudo-hook on the provided actor.
   * @param {TeriockActor} actor
   * @param {string} pseudoHook
   */
  #callPseudoHook(actor, pseudoHook) {
    actor?.defaultUser?.query("teriock.callPseudoHook", {
      uuid: actor.uuid,
      pseudoHook,
    });
  }

  /**
   * Check if the effect might expire and send a dialog to some {@link TeriockUser}.
   * @param {TeriockConsequence} effect - Effect to check expiration for.
   * @param {"turn"|"combat"|"action"} trigger - What might trigger this effect to expire.
   * @param {"start"|"end"} time - When this effect might expire.
   * @param {UUID<TeriockActor>|null} actorUuid - UUID of some {@link TeriockActor} to compare against.
   * @param {object[]} [updates] - Optional array to mutate with additional updates.
   */
  #checkExpiration(effect, trigger, time, actorUuid, updates = []) {
    const expiration = effect.system.expirations.combat;
    if (expiration.what.type === "none") return;
    if (
      expiration.when.trigger === trigger &&
      expiration.when.time === time &&
      (expiration.who.type === "everyone" ||
        (expiration.who.type === "executor" &&
          actorUuid === expiration.who.source) ||
        (expiration.who.type === "target" && actorUuid === effect.actor.uuid))
    ) {
      if (expiration.when.skip <= 0) {
        effect.actor?.defaultUser?.query("teriock.inCombatExpiration", {
          uuid: effect.uuid,
        });
      } else if (expiration.when.skip > 0) {
        updates.push({
          _id: effect.id,
          "system.expirations.combat.when.skip": expiration.when.skip - 1,
        });
      }
    }
  }

  /**
   * Give an actor its reaction back.
   * @param {TeriockActor} actor
   */
  #regainReaction(actor) {
    actor?.defaultUser?.query("teriock.update", {
      uuid: actor.uuid,
      data: { "system.combat.hasReaction": true },
    });
  }

  /**
   * Reset every actor's attack penalty.
   */
  #resetAttackPenalties() {
    game.users
      .queryGM(
        "teriock.resetAttackPenalties",
        {
          actorUuids: this.actors.map((a) => a.uuid),
        },
        {
          failPrefix:
            "TERIOCK.SYSTEMS.Combat.QUERY.resetAttackPenalties.failPrefix",
          localize: true,
        },
      )
      .then();
  }

  /**
   * @param {TeriockActor} effectActor
   * @param {TeriockActor} timeActor
   * @param {"turn"|"combat"|"action"} trigger
   * @param {"start"|"end"} time
   */
  #tryExpirations(effectActor, timeActor, trigger, time) {
    const updates = [];
    for (const effect of effectActor?.consequences || []) {
      this.#checkExpiration(effect, trigger, time, timeActor?.uuid, updates);
    }
    if (updates.length > 0) {
      game.users
        .queryGM(
          "teriock.updateEmbeddedDocuments",
          {
            uuid: effectActor.uuid,
            embeddedName: "ActiveEffect",
            updates: updates,
          },
          {
            failPrefix:
              "TERIOCK.SYSTEMS.Combat.QUERY.tryAllEffectExpirations.failPrefix",
            localize: true,
          },
        )
        .then();
    }
  }

  /** @inheritDoc */
  async endCombat() {
    let out = await super.endCombat();
    this.#resetAttackPenalties();
    for (const actor of this.actors) {
      this.#tryExpirations(actor, actor, "combat", "end");
      this.#callPseudoHook(actor, "combatEnd");
      this.#regainReaction(actor);
    }
    return out;
  }

  /** @inheritDoc */
  async nextTurn() {
    const previousActor = this.actor;
    const out = await super.nextTurn();
    if (previousActor) {
      for (const actor of this.actors) {
        this.#tryExpirations(actor, previousActor, "turn", "end");
      }
    }
    this.#resetAttackPenalties();
    this.updateCombatantActors();
    this.#callPseudoHook(previousActor, "turnEnd");
    const newActor = this.actor;
    if (newActor) {
      this.#regainReaction(newActor);
      for (const actor of this.actors) {
        this.#tryExpirations(actor, newActor, "action", "start");
        this.#tryExpirations(actor, newActor, "turn", "start");
      }
      this.#callPseudoHook(newActor, "turnStart");
    }
    return out;
  }

  /** @inheritDoc */
  async startCombat() {
    let out = await super.startCombat();
    this.#resetAttackPenalties();
    for (const actor of this.actors) {
      this.#tryExpirations(actor, actor, "combat", "start");
      this.#callPseudoHook(actor, "combatStart");
    }
    return out;
  }
}
