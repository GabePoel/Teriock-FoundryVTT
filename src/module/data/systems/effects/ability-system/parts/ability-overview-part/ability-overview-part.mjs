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
          endCondition: new TextField({
            initial: "",
            label: "End Condition",
          }),
          heightened: new TextField({
            initial: "",
            label: "Heightened",
          }),
          improvement: new TextField({
            initial: "",
            label: "Improvement",
          }),
          limitation: new TextField({
            initial: "",
            label: "Limitation",
          }),
          overview: new fields.SchemaField({
            base: new TextField({
              initial: "",
              label: "Description",
            }),
            proficient: new TextField({
              initial: "",
              label: "If Proficient",
            }),
            fluent: new TextField({
              initial: "",
              label: "If Fluent",
            }),
          }),
          requirements: new TextField({
            initial: "",
            label: "Requirements",
          }),
          trigger: new TextField({
            initial: "",
            label: "Trigger",
          }),
        });
      }
    }
  );
};
