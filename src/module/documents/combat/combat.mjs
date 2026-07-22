import { CombatExpiration } from "../../data/pseudo-documents/expirations/_module.mjs";
import { BaseExpiration } from "../../data/pseudo-documents/expirations/abstract/_module.mjs";
import { InitiativeExecution } from "../../executions/activity-executions/_module.mjs";
import * as documentMixins from "../mixins/_module.mjs";

const { Combat } = foundry.documents;

/**
 * The Teriock Combat implementation.
 * @implements {Teriock.Documents.CombatInterface}
 * @extends {ClientDocument}
 * @extends {Combat}
 * @mixes BaseDocument
 * @property {DocumentCollection<TeriockCombatant>} combatants
 */
export default class TeriockCombat extends documentMixins.BaseDocumentMixin(Combat) {
  /**
   * Call a trigger on the provided actor.
   * @param {TeriockActor} actor
   * @param {Teriock.System.Trigger} trigger
   */
  #fireTrigger(actor, trigger) {
    actor?.defaultUser?.query("teriock.fireTrigger", { trigger, uuid: actor.uuid });
  }

  /**
   * @param {TeriockActor|null} actor
   * @param {Teriock.Keys.CombatEvent} event
   * @param {Teriock.Keys.CombatTiming} timing
   */
  #refreshCombatExpirations(actor, event, timing) {
    const context = { actor, event, timing };
    if (game.user.isActiveGM) {
      BaseExpiration.massExpire(this.actors, CombatExpiration.TYPE, context, true);
    } else if (!game.users.activeGM) {
      BaseExpiration.massExpire(this.actors.filter((a) => a.defaultUser.isSelf), CombatExpiration.TYPE, context, false);
    }
  }

  /**
   * Give an actor its reaction back.
   * @param {TeriockActor} actor
   */
  #regainReaction(actor) {
    if (actor?.defaultUser?.isSelf) {
      actor.update({ "system.combat.hasReaction": true }, { asGM: true });
    }
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
    return this.combatants.filter(c => c.actor).map(c => c.actor);
  }

  /**
   * A workflow that occurs at the end of combat.
   */
  _onEndCombat() {
    this.#refreshCombatExpirations(null, "combat", "end");
    this.#resetAttackPenalties();
    for (const actor of this.actors) {
      this.#fireTrigger(actor, "combatEnd");
      this.#regainReaction(actor);
    }
  }

  /** @inheritDoc */
  _onEndRound(context) {
    super._onEndRound(context);
    this.#refreshCombatExpirations(null, "round", "end");
  }

  /** @inheritDoc */
  _onEndTurn(combatant, context) {
    super._onEndTurn(combatant, context);
    this.#refreshCombatExpirations(combatant.actor, "turn", "end");
    this.#resetAttackPenalties();
    if (combatant.actor) { this.#fireTrigger(combatant.actor, "turnEnd"); }
  }

  /**
   * A workflow that occurs at the start of Combat.
   */
  _onStartCombat() {
    this.#refreshCombatExpirations(null, "combat", "start");
    this.#resetAttackPenalties();
    for (const actor of this.actors) { this.#fireTrigger(actor, "combatStart"); }
  }

  /** @inheritDoc */
  _onStartRound(context) {
    super._onStartRound(context);
    this.#refreshCombatExpirations(null, "round", "start");
  }

  /** @inheritDoc */
  _onStartTurn(combatant, context) {
    super._onStartTurn(combatant, context);
    this.#refreshCombatExpirations(combatant.actor, "turn", "start");
    if (combatant.actor) { this.#fireTrigger(combatant.actor, "turnStart"); }
    this.#refreshCombatExpirations(combatant.actor, "action", "start");
  }

  /** @inheritDoc */
  async endCombat() {
    const out = await super.endCombat();
    this._onEndCombat();
    return out;
  }

  /** @inheritDoc */
  async rollAll(options = {}) {
    return super.rollAll(Object.assign(options, { noExecution: true }));
  }

  /** @inheritDoc */
  async rollInitiative(ids, options = {}) {
    if (ids.length === 1 && !options.noExecution) {
      const execution = await InitiativeExecution.create({}, { source: this.combatants.get(ids[0]) });
      if (execution?.message?.rolls?.length) {
        const total = execution.message.rolls[0]?.total;
        if (typeof total === "number") {
          options.formula = total.toString();
          options.messageOptions = execution.message.toObject();
          foundry.utils.setProperty(options, "formula", total.toString());
          foundry.utils.setProperty(options, "messageOptions.flags.teriock.dontCreate", true);
        }
      } else { ids = []; }
    }
    return super.rollInitiative(ids, options);
  }

  /** @inheritDoc */
  async rollNPC(options = {}) {
    return super.rollNPC(Object.assign(options, { noExecution: true }));
  }

  /** @inheritDoc */
  async startCombat() {
    const out = await super.startCombat();
    this._onStartCombat();
    return out;
  }
}
