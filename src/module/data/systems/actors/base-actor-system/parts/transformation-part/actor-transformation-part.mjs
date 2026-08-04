import { actorTransformationConfig } from "../../../../../fields/tools/transformation-fields.mjs";

const { fields } = foundry.data;

/**
 * @import { SpeciesTransformationPart } from "../../../../items/species-system/parts/species-panel-part.mjs";
 * @import { TransformationSystemMixin } from "../../../../mixins/transformation-system-mixin/transformation-system-mixin.mjs";
 */

/**
 * Actor data model that handles transformation behavior.
 *
 * Relevant wiki pages:
 * - [Transformed](https://wiki.teriock.com/index.php/Condition:Transformed)
 *
 * @template {Constructor<BaseActorSystem>} T
 * @param {T} Base
 * @see {SpeciesTransformationPart}
 * @see {TransformationSystemMixin}
 */
export default function ActorTransformationPart(Base) {
  /**
   * @extends {CommonSystem}
   * @extends {Teriock.Models.ActorTransformationPartData}
   * @mixin
   * @property {AnyActor} parent
   */
  class ActorTransformationPart extends Base {
    /** @inheritDoc */
    static defineSchema() {
      return Object.assign(super.defineSchema(), {
        transformation: new fields.SchemaField(actorTransformationConfig()),
      });
    }

    /**
     * Whether this actor is transformed.
     * @returns {boolean}
     */
    get isTransformed() {
      return Boolean(this.transformation.primary?.active);
    }

    /** @inheritDoc */
    prepareBaseData() {
      super.prepareBaseData();
      if (
        this.isTransformed
        && this.transformation.primary?.system.transformation.override.has("size")
        && this.transformation.primary?.system.primarySpecies?.system.size.value
      ) {
        this.size.value = this.transformation.primary?.system.primarySpecies.system.size.value || this.size.value;
      }
    }

    /** @inheritDoc */
    prepareDerivedData() {
      super.prepareDerivedData();
      if (this.isTransformed && this.transformation.primary?.system.transformation.override.has("art")) {
        this.transformation.img = this.transformation.primary?.system.transformation.img;
        this.transformation.ring = this.transformation.primary?.system.transformation.ring;
      }
    }
  }

  return ActorTransformationPart;
}
