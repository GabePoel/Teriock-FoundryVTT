const { fields } = foundry.data;

/**
 * Actor data model that handles transformation.
 * @param {typeof BaseActorSystem} Base
 */
export default (Base) => {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends {BaseActorSystem}
     * @implements {ActorTransformationPartInterface}
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
          species: [],
          level: "minor",
          suppression: {
            bodyParts: false,
            equipment: false,
            fluencies: false,
            ranks: false,
          },
        });
        if (effect) {
          Object.assign(this.transformation, {
            image: effect.system.transformation.image,
            level: effect.system.transformation.level,
            species: this.parent.items.contents.filter(
              (i) =>
                i.type === "species" &&
                effect.system.transformation.species.includes(i.id),
            ),
            suppression: foundry.utils.deepClone(
              effect.system.transformation.suppression,
            ),
          });
        }
        if (this.isTransformed && this.transformation.species.length > 0) {
          this.size.number.raw =
            this.transformation.species[0].system.size.value?.toString() ||
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
