import { TextField } from "../../../../../fields/_module.mjs";

const { fields } = foundry.data;

/**
 * Ability results part.
 * @param {typeof AbilitySystem} Base
 */
export default (Base) => {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends {AbilitySystem}
     * @implements {Teriock.Models.AbilityResultsPartInterface}
     * @mixin
     */
    class AbilityResultsPart extends Base {
      /** @inheritDoc */
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          results: new fields.SchemaField({
            critFail: new TextField({ initial: "" }),
            critHit: new TextField({ initial: "" }),
            critMiss: new TextField({ initial: "" }),
            critSave: new TextField({ initial: "" }),
            fail: new TextField({ initial: "" }),
            hit: new TextField({ initial: "" }),
            miss: new TextField({ initial: "" }),
            save: new TextField({ initial: "" }),
          }),
        });
      }
    }
  );
};
