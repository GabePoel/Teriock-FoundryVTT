import { queryGM, selectUser } from "../../helpers/utils.mjs";
import { BaseDocumentMixin } from "../mixins/_module.mjs";

const { Combat } = foundry.documents;

// noinspection JSClosureCompilerSyntax
/**
 * The Teriock {@link Combat} implementation.
 * @extends {ClientDocument}
 * @extends {Combat}
 * @mixes BaseDocument
 * @property {Collection<UUID<TeriockCombatant>, TeriockCombatant>} combatants
 */
export default class TeriockCombat extends BaseDocumentMixin(Combat) {
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
   * @param {UUID<TeriockActor>|null} actorUuid - UUID of some {@link TeriockActor} to compare against.
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
    const expirations = effect.system.expirations.combat;
    if (
      expirations.what.type !== "none" &&
      expirations.when.trigger === trigger &&
      expirations.when.time === time &&
      (expirations.who.type === "everyone" ||
        (expirations.who.type === "executor" &&
          actorUuid === expirations.who.source) ||
        (expirations.who.type === "target" && actorUuid === effect.actor.uuid))
    ) {
      const user = selectUser(effect.actor);
      if (expirations.when.skip <= 0 && user) {
        try {
          await user.query("teriock.inCombatExpiration", {
            effectUuid: effect.uuid,
          });
        } catch {
          await queryGM(
            "teriock.inCombatExpiration",
            {
              effectUuid: effect.uuid,
            },
            { notifyFailure: false },
          );
        }
      } else if (expirations.when.skip > 0) {
        updates.push({
          _id: effect.id,
          "system.expirations.combat.when.skip": expirations.when.skip - 1,
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
      await queryGM(
        "teriock.updateEmbeddedDocuments",
        {
          uuid: effectActor.uuid,
          embeddedName: "ActiveEffect",
          updates: updates,
        },
        {
          failPrefix: "Could not expire effects.",
        },
      );
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
    const previousActor = this.combatant?.actor;

    // Turn change
    const out = await super.nextTurn();

    // End of turn
    // This happens after turn change so that the turn change doesn't get stuck
    // waiting for effect expirations. This is also why we don't await.
    if (previousActor) {
      for (const actor of this.actors) {
        this._tryAllEffectExpirations(
          actor,
          previousActor,
          "turn",
          "end",
        ).then();
      }
    }
    const actors = [
      ...Object.values(game.actors.tokens),
      ...this.actors,
      ...game.scenes.active.tokens.contents
        .map((t) => t.actor)
        .filter((a) => a),
    ];
    await queryGM(
      "teriock.resetAttackPenalties",
      {
        actorUuids: Array.from(new Set(actors.map((a) => a.uuid))),
      },
      {
        failPrefix: "Could not reset attack penalties.",
      },
    );
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
      this._tryAllEffectExpirations(actor, newActor, "action", "start").then();
      this._tryAllEffectExpirations(actor, newActor, "turn", "start").then();
    }
    if (newActor) {
      const newUser = selectUser(newActor);
      if (newUser) {
        await newUser.query("teriock.update", {
          uuid: newActor.uuid,
          data: { "system.combat.hasReaction": true },
        });
        await newUser.query("teriock.callPseudoHook", {
          uuid: newActor.uuid,
          pseudoHook: "turnStart",
          data: {},
        });
      }
    }

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
