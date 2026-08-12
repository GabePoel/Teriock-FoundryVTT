import { LongRestExecution, ShortRestExecution } from "../../../../../executions/actor-executions/_module.mjs";

/**
 * Relevant wiki pages:
 * - [Long Rest](https://wiki.teriock.com/index.php/Core:Long_Rest)
 * - [Short Rest](https://wiki.teriock.com/index.php/Core:Short_Rest)
 *
 * @template {AnyConstructor} T
 * @param {T} Base
 * @returns {MixinResult<T, ActorRestingPart>}
 */
export default function ActorRestingPart(Base) {
  /**
   * @mixin
   * @property {AnyActor} parent
   */
  class ActorRestingPart extends Base {
    /**
     * @param {object} [options]
     * @param {boolean} [options.hp]
     * @param {boolean} [options.hpDice]
     * @param {boolean} [options.mp]
     * @param {boolean} [options.mpDice]
     * @param {boolean} [options.conditions]
     * @param {boolean} [options.hacks]
     * @param {boolean} [options.cover]
     * @param {boolean} [options.combat]
     */
    async partialReset(options = {}) {
      const actorUpdate = {};
      const itemUpdates = [];
      const statuses = [];
      if (options.hp) { actorUpdate["system.hp.value"] = this.hp.max; }
      if (options.mp) { actorUpdate["system.mp.value"] = this.mp.max; }
      if (options.hpDice || options.mpDice) {
        for (const item of this.parent.items.filter(i => i.metadata.stats)) {
          const itemUpdate = { _id: item.id };
          if (options.hpDice) { itemUpdate["system.statDice.hp.spent"] = []; }
          if (options.mpDice) { itemUpdate["system.statDice.mp.spent"] = []; }
          itemUpdates.push(itemUpdate);
        }
      }
      if (options.conditions) { statuses.push(...Object.values(TERIOCK.statuses.conditions).map(s => s.id)); }
      if (options.hacks) { statuses.push(...Object.values(TERIOCK.statuses.hacks).map(s => s.id)); }
      if (options.cover) { statuses.push(...Object.values(TERIOCK.statuses.cover).map(s => s.id)); }
      if (options.combat) {
        actorUpdate["system.combat.attackPenalty"] = 0;
        actorUpdate["system.combat.hasReaction"] = true;
      }
      await this.parent.updateEmbeddedDocuments("Item", itemUpdates);
      await this.parent.update(actorUpdate);
      await this.parent.removeStatusEffects(statuses.filter(s => this.parent.statuses.has(s)));
    }

    /**
     * Actor experiences dawn.
     * @returns {Promise<void>}
     */
    async takeDawn() {
      await this.actor.hookCall("dawn");
    }

    /**
     * Actor experiences dusk.
     * @returns {Promise<void>}
     */
    async takeDusk() {
      await this.actor.hookCall("dusk");
    }

    /**
     * Take a long rest.
     *
     * Relevant wiki pages:
     * - [Long Rest](https://wiki.teriock.com/index.php/Core:Long_Rest)
     *
     * @param {Partial<Teriock.Execution.ExecutionOptions>} [options]
     * @returns {Promise<void>}
     */
    async takeLongRest(options = {}) {
      await LongRestExecution.create({}, Object.assign(options, { actor: this.parent, source: this.parent }));
    }

    /**
     * Take a short rest.
     *
     * Relevant wiki pages:
     * - [Short Rest](https://wiki.teriock.com/index.php/Core:Short_Rest)
     *
     * @param {Partial<Teriock.Execution.ExecutionOptions>} [options]
     * @returns {Promise<void>}
     */
    async takeShortRest(options = {}) {
      await ShortRestExecution.create({}, Object.assign(options, { actor: this.parent, source: this.parent }));
    }
  }

  return ActorRestingPart;
}
