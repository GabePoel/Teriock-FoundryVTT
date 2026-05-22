import { hackConfig } from "../../../../../../constants/config/hack-config.mjs";
import { objectMap } from "../../../../../../helpers/utils.mjs";
import { initialBar, initialSchema } from "../../../../../fields/helpers/initializers.mjs";

/**
 * Actor data model mixin that handles hacks.
 * @param {typeof BaseActorSystem} Base
 */
export default Base => {
  return (
    /**
     * @extends {CommonSystem}
     * @extends {Teriock.Models.ActorHacksPartData}
     * @mixin
     */
    class ActorHacksPart extends Base {
      /** @inheritDoc */
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          hacks: new initialSchema(objectMap(hackConfig, conf => initialBar({ max: conf.max }))),
        });
      }

      /** @inheritDoc */
      getRollData() {
        const rollData = super.getRollData();
        for (const [k, v] of Object.entries(this.hacks || {})) rollData[`hack.${k}`] = v.value;
        return rollData;
      }

      /**
       * Applies hack effect to a specific part of the actor.
       *
       * Relevant wiki pages:
       * - [Hack](https://wiki.teriock.com/index.php/Damage:Hack)
       *
       * @param {Teriock.Keys.HackableBodyPart} part - The part to hack.
       * @param {number} [amount]
       * @returns {Promise<void>}
       */
      async takeHack(part, amount = 1) {
        await this.parent.hookCall("takeHack", { scope: { amount, part } });
        const value = this.parent.system.hacks[part].value;
        const max = Math.min(value + amount, hackConfig[part].max);
        const ids = [];
        for (let i = value; i < max; i++) {
          const id = (hackConfig[part]?.statuses ?? [])[i];
          if (id) ids.push(id);
        }
        await this.parent.applyStatusEffects(ids);
      }

      /**
       * Removes hack effect from a specific part of the actor.
       *
       * Relevant wiki pages:
       * - [Hack](https://wiki.teriock.com/index.php/Damage:Hack)
       *
       * @param {Teriock.Keys.HackableBodyPart} part - The part to unhack.
       * @param {number} [amount]
       * @returns {Promise<void>}
       */
      async takeUnhack(part, amount = 1) {
        await this.parent.hookCall("takeUnhack", { scope: { amount, part } });
        /** @type {TeriockHack[]} */
        const hacks = this.parent.effects.contents.filter(c => c.type === "hack" && c.system.part === part);
        const removable = hacks.filter(h => !h.system.permanent).sort((a, b) =>
          b.system.escalation - a.system.escalation
        );
        const toRemove = removable.slice(0, amount);
        await this.parent.deleteEmbeddedDocuments("ActiveEffect", toRemove.map(e => e.id));
      }
    }
  );
};
