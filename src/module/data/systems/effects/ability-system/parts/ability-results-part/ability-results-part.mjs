const { fields } = foundry.data;

/**
 * Ability results part.
 * @param {typeof AbilitySystem} Base
 */
export default Base => {
  return (
    /**
     * @extends {BaseEffectSystem}
     * @extends {Teriock.Models.AbilityResultsPartData}
     * @mixin
     */
    class AbilityResultsPart extends Base {
      /** @inheritDoc */
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          results: new fields.SchemaField({
            critFail: new fields.HTMLField({ initial: "" }),
            critHit: new fields.HTMLField({ initial: "" }),
            critMiss: new fields.HTMLField({ initial: "" }),
            critSave: new fields.HTMLField({ initial: "" }),
            fail: new fields.HTMLField({ initial: "" }),
            hit: new fields.HTMLField({ initial: "" }),
            miss: new fields.HTMLField({ initial: "" }),
            save: new fields.HTMLField({ initial: "" }),
          }),
        });
      }
    }
  );
};
