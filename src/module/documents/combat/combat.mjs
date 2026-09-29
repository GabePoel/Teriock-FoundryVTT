import { CombatExpiration } from "../../data/pseudo-documents/expirations/_module.mjs";
import { BaseExpiration } from "../../data/pseudo-documents/expirations/abstract/_module.mjs";
import { InitiativeExecution } from "../../executions/activity-executions/_module.mjs";
import { mixClasses } from "../../helpers/construction.mjs";
import { BaseDocumentMixin } from "../mixins/_module.mjs";

const { Combat } = foundry.documents;

/**
 * The Teriock Combat implementation.
 * @mixes BaseDocument
 */
export default class TeriockCombat extends mixClasses(Combat, BaseDocumentMixin) {
  /**
   * Reset every actor's attack penalty and the given actors' actions and reactions.
   * @param {object} [options]
   * @param {(TeriockActor|null)[]} [options.actionActors] - Actors whose actions reset.
   * @param {(TeriockActor|null)[]} [options.reactionActors] - Actors whose reactions reset.
   */
  #changeTurn({ actionActors = [], reactionActors = [] } = {}) {
    game.users.queryGM("teriock.turnChange", {
      actionUuids: actionActors.filter(a => a && a.system.combat.actions < 3).map(a => a.uuid),
      attackPenaltyUuids: this.actors.filter(a => a.system.combat.attackPenalty !== 0).map(a => a.uuid),
      reactionUuids: reactionActors.filter(a => a && a.system.combat.reactions < 1).map(a => a.uuid),
    }, { failPrefix: "TERIOCK.SYSTEMS.Combat.QUERY.turnChange.failPrefix", localize: true });
  }

  /**
   * Call a trigger on the provided actor.
   * @param {TeriockActor} actor
   * @param {Teriock.System.Trigger} trigger
   */
  #fireTrigger(actor, trigger) {
    if (actor?.shouldFireTriggers) { actor.fireTrigger(trigger); }
  }

  /**
   * @param {TeriockActor|null} actor
   * @param {Teriock.Keys.CombatEvent} event
   * @param {Teriock.Keys.CombatTiming} timing
   */
  #refreshCombatExpirations(actor, event, timing) {
    BaseExpiration.massExpire(this.actors, CombatExpiration.metadata.type, { actor, event, timing });
  }

  /**
   * The current acting actor.
   * @returns {TeriockActor|null}
   */
  get actor() {
    return this.combatant ? this.combatant.actor || null : null;
  }

  /**
   * The actors in this combat.
   * @returns {TeriockActor[]}
   */
  get actors() {
    return this.combatants.filter(c => c.actor).map(c => c.actor);
  }

  /**
   * A workflow that occurs at the end of combat.
   */
  _onEndCombat() {
    this.#refreshCombatExpirations(null, "combat", "end");
    this.#changeTurn({ actionActors: this.actors, reactionActors: this.actors });
    for (const actor of this.actors) { this.#fireTrigger(actor, "combatEnd"); }
  }

  /** @inheritDoc */
  async _onEndRound(context) {
    await super._onEndRound(context);
    this.#refreshCombatExpirations(null, "round", "end");
  }

  /** @inheritDoc */
  async _onEndTurn(combatant, context) {
    await super._onEndTurn(combatant, context);
    this.#refreshCombatExpirations(combatant.actor, "turn", "end");
    if (combatant.actor) { this.#fireTrigger(combatant.actor, "turnEnd"); }
  }

  /**
   * A workflow that occurs at the start of Combat.
   */
  _onStartCombat() {
    this.#refreshCombatExpirations(null, "combat", "start");
    for (const actor of this.actors) { this.#fireTrigger(actor, "combatStart"); }
  }

  /** @inheritDoc */
  async _onStartRound(context) {
    await super._onStartRound(context);
    this.#refreshCombatExpirations(null, "round", "start");
  }

  /** @inheritDoc */
  async _onStartTurn(combatant, context) {
    await super._onStartTurn(combatant, context);
    const actors = context.round === 1 && context.turn === 0 ? this.actors : [combatant.actor];
    this.#changeTurn({ actionActors: actors, reactionActors: actors });
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
