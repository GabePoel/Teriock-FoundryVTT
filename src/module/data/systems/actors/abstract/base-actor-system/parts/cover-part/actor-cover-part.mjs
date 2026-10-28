import { FormulaField } from "../../../../../../fields/_module.mjs";
import { initialNumber } from "../../../../../../fields/tools/initializers.mjs";

/**
 * @import AbstractActorSystem from "../../abstract-actor-system.mjs";
 */

/**
 * Actor data model that handles cover.
 *
 * Relevant wiki pages:
 * - [Cover](https://wiki.teriock.com/index.php/Core:Cover)
 *
 * @template {MixinBase<typeof AbstractActorSystem>} T
 * @param {T} Base
 */
export default function ActorCoverPart(Base) {
  /**
   * @mixin
   * @implements {Teriock.Models.ActorCoverPartData}
   * @property {TeriockActor} parent
   */
  class ActorCoverPart extends /** @type {InitializedDataModel<T, Teriock.Models.ActorCoverPartData>} */ (Base) {
    /** @inheritDoc */
    static defineSchema() {
      return Object.assign(super.defineSchema(), { cover: initialNumber() });
    }

    /** @inheritDoc */
    prepareDerivedData() {
      super.prepareDerivedData();
      if (this.cover === 1) {
        if (!this.lockedPaths.has("system.defense.ac")) { this.defense.ac += 2; }
        this.attributes.mov.bonus = FormulaField.add(this.attributes.mov.bonus, "2");
      } else if (this.cover >= 2) {
        if (!this.lockedPaths.has("system.defense.ac")) { this.defense.ac += 5; }
        this.attributes.mov.bonus = FormulaField.add(this.attributes.mov.bonus, "5");
      }
    }
  }

  return ActorCoverPart;
}
