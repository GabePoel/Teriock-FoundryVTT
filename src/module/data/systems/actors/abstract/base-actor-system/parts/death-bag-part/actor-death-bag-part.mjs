import { deathBagSchema } from "../../../../../../fields/tools/builders.mjs";

/**
 * @import AbstractActorSystem from "../../abstract-actor-system.mjs";
 */

const { fields } = foundry.data;

/**
 * Actor data model mixin that handles the death bag.
 *
 * Relevant wiki pages:
 * - [Death Bag](https://wiki.teriock.com/index.php/Core:Death_Bag)
 *
 * @template {MixinBase<typeof AbstractActorSystem>} T
 * @param {T} Base
 */
export default function ActorDeathBagPart(Base) {
  /**
   * @mixin
   * @implements {Teriock.Models.ActorDeathBagPartData}
   * @property {TeriockActor} parent
   */
  class ActorDeathBagPart extends /** @type {InitializedDataModel<T, Teriock.Models.ActorDeathBagPartData>} */ (Base) {
    /** @inheritDoc */
    static defineSchema() {
      return Object.assign(super.defineSchema(), { deathBag: new fields.SchemaField(deathBagSchema()) });
    }

    /** @inheritDoc */
    getRollData() {
      const rollData = super.getRollData();
      rollData["bag.pull"] = this.deathBag.pull;
      rollData["bag.stones"] = Object.values(this.deathBag.stones).reduce((total, n) => total + n, 0);
      for (const color of Object.keys(this.deathBag.stones)) {
        rollData[`bag.stones.${color}`] = this.deathBag.stones[color];
      }
      return rollData;
    }
  }

  return ActorDeathBagPart;
}
