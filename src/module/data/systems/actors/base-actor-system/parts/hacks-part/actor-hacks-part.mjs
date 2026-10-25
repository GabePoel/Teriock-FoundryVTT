import { objectMap } from "../../../../../../utils/_module.mjs";
import { initialBar, initialSchema } from "../../../../../fields/tools/initializers.mjs";

/**
 * @import AbstractActorSystem from "../../abstract-actor-system.mjs";
 */

/**
 * Actor data model mixin that handles hacks.
 *
 * Relevant wiki pages:
 * - [Hacked](https://wiki.teriock.com/index.php/Condition:Hacked)
 *
 * @template {MixinBase<typeof AbstractActorSystem>} T
 * @param {T} Base
 */
export default function ActorHacksPart(Base) {
  /**
   * @mixin
   * @implements {Teriock.Models.ActorHacksPartData}
   * @property {TeriockActor} parent
   */
  class ActorHacksPart extends /** @type {InitializedDataModel<T, Teriock.Models.ActorHacksPartData>} */ (Base) {
    /** @inheritDoc */
    static defineSchema() {
      return Object.assign(super.defineSchema(), {
        hacks: initialSchema(objectMap(TERIOCK.CONFIG.hack, conf => initialBar({ max: conf.max }))),
      });
    }

    /** @inheritDoc */
    getRollData() {
      const rollData = super.getRollData();
      for (const [k, v] of Object.entries(this.hacks || {})) { rollData[`hack.${k}`] = v.value; }
      return rollData;
    }
  }

  return ActorHacksPart;
}
