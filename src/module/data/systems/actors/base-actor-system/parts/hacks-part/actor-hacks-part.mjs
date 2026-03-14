import { objectMap } from "../../../../../../helpers/utils.mjs";

/**
 * Actor data model mixin that handles hacks.
 * @param {typeof BaseActorSystem} Base
 */
export default (Base) => {
  return (
    /**
     * @extends {CommonSystem}
     * @extends {Teriock.Models.ActorHacksPartInterface}
     * @mixin
     */
    class ActorHacksPart extends Base {
      /** @inheritDoc */
      getRollData() {
        const rollData = super.getRollData();
        for (const [k, v] of Object.entries(this.hacks || {})) {
          rollData[`hack.${k}`] = v.value;
        }
        return rollData;
      }

      /** @inheritDoc */
      prepareBaseData() {
        super.prepareBaseData();
        this.hacks = objectMap(TERIOCK.options.hack, (conf) => {
          return {
            min: 0,
            max: conf.max,
            value: 0,
          };
        });
      }

      /**
       * Applies hack effect to a specific part of the actor.
       *
       * Relevant wiki pages:
       * - [Hack](https://wiki.teriock.com/index.php/Damage:Hack)
       *
       * @param {Teriock.Parameters.Actor.HackableBodyPart} part - The part to hack.
       * @param {number} [amount]
       * @returns {Promise<void>}
       */
      async takeHack(part, amount = 1) {
        await this.parent.hookCall("takeHack", { scope: { part, amount } });
        const value = this.parent.system.hacks[part].value;
        const max = Math.min(value + amount, TERIOCK.options.hack[part].max);
        const ids = [];
        for (let i = value; i < max; i++) {
          ids.push(TERIOCK.data.hacks[part + (i + 1).toString()].id);
        }
        await this.parent.applyStatusEffects(ids);
      }

      /**
       * Removes hack effect from a specific part of the actor.
       *
       * Relevant wiki pages:
       * - [Hack](https://wiki.teriock.com/index.php/Damage:Hack)
       *
       * @param {Teriock.Parameters.Actor.HackableBodyPart} part - The part to unhack.
       * @param {number} [amount]
       * @returns {Promise<void>}
       */
      async takeUnhack(part, amount = 1) {
        await this.parent.hookCall("takeUnhack", { scope: { part, amount } });
        const value = this.parent.system.hacks[part].value;
        const min = Math.max(value - amount, 0);
        const ids = [];
        for (let i = value; i > min; i--) {
          ids.push(TERIOCK.data.hacks[part + i.toString()].id);
        }
        await this.parent.removeStatusEffects(ids);
      }
    }
  );
};
