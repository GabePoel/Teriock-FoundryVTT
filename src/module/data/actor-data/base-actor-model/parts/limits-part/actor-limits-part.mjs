import { EvaluationField } from "../../../../fields/_module.mjs";

const { fields } = foundry.data;

/**
 * Actor data model that handles limits.
 * @param {typeof TeriockBaseActorModel} Base
 */
export default (Base) => {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends {TeriockBaseActorModel}
     * @implements {ActorLimitsPartInterface}
     * @mixin
     */
    class ActorLimitsPart extends Base {
      /** @inheritDoc */
      static defineSchema() {
        const schema = super.defineSchema();
        Object.assign(schema, {
          magic: new fields.SchemaField({
            maxRotators: new EvaluationField({
              deterministic: true,
              floor: true,
            }),
          }),
        });
        return schema;
      }

      /** @inheritDoc */
      prepareBaseData() {
        super.prepareBaseData();
        this.curses = {
          max: 3,
          min: 0,
          value: this.parent.powers.filter((p) => p.system.type === "curse")
            .length,
        };
      }

      /** @inheritDoc */
      prepareDerivedData() {
        super.prepareDerivedData();
        this.magic.maxRotators.evaluate();
      }
    }
  );
};
