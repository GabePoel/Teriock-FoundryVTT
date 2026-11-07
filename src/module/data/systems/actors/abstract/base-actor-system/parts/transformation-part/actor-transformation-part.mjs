import { actorTransformationConfig } from "../../../../../../fields/tools/transformation-fields.mjs";

/**
 * @import { SpeciesTransformationPart } from "../../../../../items/species-system/parts/species-panel-part.mjs";
 * @import { TransformationSystemMixin } from "../../../../../mixins/transformation-system-mixin/transformation-system-mixin.mjs";
 * @import AbstractActorSystem from "../../abstract-actor-system.mjs";
 */

const { fields } = foundry.data;

/**
 * Actor data model that handles transformation behavior.
 *
 * Relevant wiki pages:
 * - [Transformed](https://wiki.teriock.com/index.php/Condition:Transformed)
 *
 * @template {MixinBase<typeof AbstractActorSystem>} T
 * @param {T} Base
 * @see {SpeciesTransformationPart}
 * @see {TransformationSystemMixin}
 * @category Transformation
 */
export default function ActorTransformationPart(Base) {
  /**
   * @mixin
   * @implements {Teriock.Models.ActorTransformationPartData}
   * @property {TeriockActor} parent
   */
  class ActorTransformationPart
    extends /** @type {InitializedDataModel<T, Teriock.Models.ActorTransformationPartData>} */ (Base)
  {
    /** @inheritDoc */
    static defineSchema() {
      return Object.assign(super.defineSchema(), {
        transformation: new fields.SchemaField(actorTransformationConfig()),
      });
    }
  }

  return ActorTransformationPart;
}
