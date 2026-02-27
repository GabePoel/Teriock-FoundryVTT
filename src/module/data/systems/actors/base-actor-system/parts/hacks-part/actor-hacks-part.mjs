import { hacksData } from "../../../../../../constants/data/hacks.mjs";
import { hackOptions } from "../../../../../../constants/options/hack-options.mjs";
import { objectMap } from "../../../../../../helpers/utils.mjs";

/**
 * Actor data model mixin that handles hacks.
 * @param {typeof BaseActorSystem} Base
 */
export default (Base) => {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends {BaseActorSystem}
     * @implements {ActorHacksPartInterface}
     * @mixin
     */
    class ActorHacksPart extends Base {
      /**
       * Clear all hacks of a given part.
       * @param {Teriock.Parameters.Actor.HackableBodyPart} part
       * @returns {Promise<void>}
       */
      async clearHacks(part) {
        const ids = [];
        for (let i = 0; i < hackOptions[part].max; i++) {
          ids.push(hacksData[part + (i + 1).toString()]._id);
        }
        await this.parent.deleteEmbeddedDocuments("ActiveEffect", ids);
      }

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
        this.hacks = objectMap(hackOptions, (conf) => {
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
        const data = { part };
        await this.parent.hookCall("takeHack", data);
        if (data.cancel) return;
        part = data.part;
        const value = this.parent.system.hacks[part].value;
        const max = Math.min(value + amount, hackOptions[part].max);
        const ids = [];
        for (let i = value; i < max; i++) {
          ids.push(hacksData[part + (i + 1).toString()].id);
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
        const data = { part };
        await this.parent.hookCall("takeUnhack", data);
        if (data.cancel) return;
        part = data.part;
        const value = this.parent.system.hacks[part].value;
        const min = Math.max(value - amount, 0);
        const ids = [];
        for (let i = value; i > min; i--) {
          ids.push(hacksData[part + i.toString()].id);
        }
        await this.parent.removeStatusEffects(ids);
      }
    }
  );
};
