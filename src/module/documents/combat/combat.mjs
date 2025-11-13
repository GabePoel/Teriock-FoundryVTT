import { selectUser } from "../../helpers/utils.mjs";
import { BlankMixin } from "../mixins/_module.mjs";

const { Combat } = foundry.documents;

// noinspection JSClosureCompilerSyntax
/**
 * The Teriock {@link Combat} implementation.
 * @extends {Combat}
 * @mixes ClientDocumentMixin
 * @property {Collection<Teriock.UUID<TeriockCombatant>, TeriockCombatant>} combatants
 */
export default class TeriockCombat extends BlankMixin(Combat) {
  /**
   * The actors in this combat.
   * @returns {TeriockActor[]}
   */
  get actors() {
    const actors = this.combatants.map((c) => c.actor);
    return Array.from(actors.filter((a) => a));
  }

  /**
   * Check if the effect might expire and send a dialog to some {@link TeriockUser}.
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
        try {
          await user.query("teriock.inCombatExpiration", {
            effectUuid: effect.uuid,
          });
        } catch {
          const activeGM = game.users.activeGM;
          await activeGM?.query("teriock.inCombatExpiration", {
            effectUuid: effect.uuid,
          });
        }
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
   * @param {TeriockActor} effectActor
   * @param {TeriockActor} timeActor
   * @param {"turn"|"combat"|"action"} trigger
   * @param {"start"|"end"} time
   * @returns {Promise<void>}
   * @private
   */
  async _tryAllEffectExpirations(effectActor, timeActor, trigger, time) {
    const updates = [];
    for (const effect of effectActor?.consequences || []) {
      await this._confirmEffectExpiration(
        effect,
        trigger,
        time,
        timeActor?.uuid,
        updates,
      );
    }
    if (updates.length > 0) {
      const activeGM = game.users.activeGM;
      await activeGM?.query("teriock.updateEmbeddedDocuments", {
        uuid: effectActor.uuid,
        embeddedName: "ActiveEffect",
        updates: updates,
      });
    }
  }

  /** @inheritDoc */
  async endCombat() {
    let out = await super.endCombat();
    for (const actor of this.actors) {
      await this._tryAllEffectExpirations(actor, actor, "combat", "end");
    }
    return out;
  }

  /** @inheritDoc */
  async nextTurn() {
    // Turn change
    const out = await super.nextTurn();

    // End of turn
    // This happens after turn change so that the turn change doesn't get stuck
    // waiting for effect expirations.
    const previousActor = this.combatant?.actor;
    if (previousActor) {
      for (const actor of this.actors) {
        await this._tryAllEffectExpirations(
          actor,
          previousActor,
          "turn",
          "end",
        );
      }
    }
    const activeGM = game.users.activeGM;
    const actors = [
      ...Object.values(game.actors.tokens),
      ...this.actors,
      ...game.scenes.active.tokens.contents
        .map((t) => t.actor)
        .filter((a) => a),
    ];
    if (activeGM) {
      await activeGM?.query("teriock.resetAttackPenalties", {
        actorUuids: Array.from(new Set(actors.map((a) => a.uuid))),
      });
    }
    this.updateCombatantActors();
    if (previousActor) {
      const previousUser = selectUser(previousActor);
      if (previousUser) {
        await previousUser.query("teriock.callPseudoHook", {
          uuid: previousActor.uuid,
          pseudoHook: "turnEnd",
          data: {},
        });
      }
    }

    // Start of turn
    const newActor = this.combatant?.actor;
    for (const actor of this.actors) {
      await this._tryAllEffectExpirations(actor, newActor, "action", "start");
      await this._tryAllEffectExpirations(actor, newActor, "turn", "start");
    }
    if (newActor) {
      if (activeGM) {
        await activeGM?.query("teriock.update", {
          uuid: newActor.uuid,
          data: { "system.combat.hasReaction": true },
        });
      }
      const newUser = selectUser(newActor);
      if (newUser) {
        await newUser.query("teriock.callPseudoHook", {
          uuid: newActor.uuid,
          pseudoHook: "turnStart",
          data: {},
        });
      }
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
}
