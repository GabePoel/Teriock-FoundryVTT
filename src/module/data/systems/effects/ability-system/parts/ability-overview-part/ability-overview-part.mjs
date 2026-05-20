const { fields } = foundry.data;

/**
 * Ability overview part.
 * @param {typeof AbilitySystem} Base
 */
export default Base => {
  return (
    /**
     * @extends {BaseEffectSystem}
     * @extends {Teriock.Models.AbilityOverviewPartData}
     * @mixin
     */
    class AbilityOverviewPart extends Base {
      /** @inheritDoc */
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          endCondition: new fields.HTMLField({ initial: "" }),
          heightened: new fields.HTMLField({ initial: "" }),
          improvement: new fields.HTMLField({ initial: "" }),
          limitation: new fields.HTMLField({ initial: "" }),
          overview: new fields.SchemaField({
            base: new fields.HTMLField({ initial: "" }),
            fluent: new fields.HTMLField({ initial: "" }),
            proficient: new fields.HTMLField({ initial: "" }),
          }),
          requirements: new fields.HTMLField({ initial: "" }),
          trigger: new fields.HTMLField({ initial: "" }),
        });
      }
    }
  );
};
