const { fields } = foundry.data;

/**
 * Actor data model that handles transformation.
 * @param {typeof BaseActorSystem} Base
 */
export default (Base) => {
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
          transformation: new fields.SchemaField({
            primary: new fields.DocumentIdField({
              nullable: true,
              initial: null,
            }),
          }),
        });
      }

      /**
       * Whether this actor is transformed.
       * @returns {boolean}
       */
      get isTransformed() {
        return Boolean(
          this.transformation.effect && this.transformation.effect.active,
        );
      }

      /** @inheritDoc */
      prepareBaseData() {
        super.prepareBaseData();
        const effect =
          /** @type {TeriockConsequence} */ this.parent.effects.get(
            this.transformation.primary,
          ) || null;
        Object.assign(this.transformation, {
          effect,
          image: null,
          level: "minor",
        });
        if (effect) {
          Object.assign(this.transformation, {
            image: effect.system.transformation.image,
            level: effect.system.transformation.level,
          });
        }
        if (
          this.isTransformed &&
          this.transformation?.effect?.system.primarySpecies?.system.size.value
        ) {
          this.size.number.raw =
            this.transformation.effect.system.primarySpecies.system.size.value.toString() ||
            this.size.number.raw;
        }
      }

      /** @inheritDoc */
      prepareDerivedData() {
        super.prepareDerivedData();
        if (this.transformation.effect) {
          this.transformation.image =
            this.transformation.effect.system.transformation.image;
        }
      }
    }
  );
};
