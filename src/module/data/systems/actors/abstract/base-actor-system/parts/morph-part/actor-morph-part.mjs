import { actorMorphFields } from "../../../../../../fields/tools/morph-fields.mjs";

/**
 * @import { SpeciesMorphPart } from "../../../../../items/species-system/parts/species-panel-part.mjs";
 * @import { MorphSystemMixin } from "../../../../../mixins/morph-system-mixin/morph-system-mixin.mjs";
 * @import AbstractActorSystem from "../../abstract-actor-system.mjs";
 */

const { fields } = foundry.data;

/**
 * Actor data model that handles morph behavior.
 *
 * Relevant wiki pages:
 * - [Transformed](https://wiki.teriock.com/index.php/Condition:Transformed)
 *
 * @template {MixinBase<typeof AbstractActorSystem>} T
 * @param {T} Base
 * @see {SpeciesMorphPart}
 * @see {MorphSystemMixin}
 * @category Morph
 */
export default function ActorMorphPart(Base) {
  /**
   * @mixin
   * @implements {Teriock.Models.ActorMorphPartData}
   * @property {TeriockActor} parent
   */
  class ActorMorphPart extends /** @type {InitializedDataModel<T, Teriock.Models.ActorMorphPartData>} */ (Base) {
    /** @inheritDoc */
    static defineSchema() {
      return Object.assign(super.defineSchema(), { morph: new fields.SchemaField(actorMorphFields()) });
    }

    /** @inheritDoc */
    static migrateData(source, options) {
      foundry.abstract.Document._addDataFieldMigration(source, "transformation", "morph");
      return super.migrateData(source, options);
    }
  }

  return ActorMorphPart;
}
