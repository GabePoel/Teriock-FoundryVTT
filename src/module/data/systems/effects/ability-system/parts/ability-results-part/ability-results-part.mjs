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
            hit: new TextField({
              initial: "",
              label: "On Hit",
            }),
            critHit: new TextField({
              initial: "",
              label: "On Critical Hit",
            }),
            miss: new TextField({
              initial: "",
              label: "On Miss",
            }),
            critMiss: new TextField({
              initial: "",
              label: "On Critical Miss",
            }),
            save: new TextField({
              initial: "",
              label: "On Success",
            }),
            critSave: new TextField({
              initial: "",
              label: "On Critical Success",
            }),
            fail: new TextField({
              initial: "",
              label: "On Fail",
            }),
            critFail: new TextField({
              initial: "",
              label: "On Critical Fail",
            }),
          }),
        });
      }
    }
  );
};
