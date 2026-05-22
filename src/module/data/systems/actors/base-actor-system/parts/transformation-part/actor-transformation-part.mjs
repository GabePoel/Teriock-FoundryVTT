import { actorTransformationConfig } from "../../../../../fields/helpers/transformation-fields.mjs";

const { fields } = foundry.data;

/**
 * Actor data model that handles transformation.
 * @param {typeof BaseActorSystem} Base
 */
export default Base => {
  return (
    /**
     * @extends {CommonSystem}
     * @extends {Teriock.Models.ActorTransformationPartData}
     * @mixin
     */
    class ActorAutomationPart extends Base {
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
        return !!this.transformation.primary?.active;
      }

      /** @inheritDoc */
      prepareBaseData() {
        super.prepareBaseData();
        if (
          this.isTransformed
          && this.transformation.primary?.system.transformation.override.has("size")
          && this.transformation.primary?.system.primarySpecies?.system.size.value
        ) {
          this.size.number = this.transformation.primary?.system.primarySpecies.system.size.value || this.size.number;
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
  );
};
