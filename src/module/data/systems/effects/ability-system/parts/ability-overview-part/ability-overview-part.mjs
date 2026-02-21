import { TextField } from "../../../../../fields/_module.mjs";

const { fields } = foundry.data;

/**
 * Ability overview part.
 * @param {typeof AbilitySystem} Base
 */
export default (Base) => {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends {AbilitySystem}
     * @implements {Teriock.Models.AbilityOverviewPartInterface}
     * @mixin
     */
    class AbilityOverviewPart extends Base {
      /** @inheritDoc */
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          endCondition: new TextField({ initial: "" }),
          heightened: new TextField({ initial: "" }),
          improvement: new TextField({ initial: "" }),
          limitation: new TextField({ initial: "" }),
          overview: new fields.SchemaField({
            base: new TextField({ initial: "" }),
            proficient: new TextField({ initial: "" }),
            fluent: new TextField({ initial: "" }),
          }),
          requirements: new TextField({ initial: "" }),
          trigger: new TextField({ initial: "" }),
        });
      }
    }
  );
};
