import { FormulaField } from "../../fields/_module.mjs";
import BaseAutomation from "./base-automation.mjs";

const { fields } = foundry.data;

export default class ThresholdAutomation extends BaseAutomation {
  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      modification: new fields.StringField({
        choices: {
          advantage: "Advantage",
          disadvantage: "Disadvantage",
        },
        initial: null,
        nullable: true,
        label: "Modification",
        hint: "Modifications that get applied to the roll by default.",
      }),
      bonus: new FormulaField({
        initial: "0",
        label: "Bonus",
        hint: "Formula that defines a bonus that gets applied to the roll.",
      }),
    });
  }

  /** @inheritDoc */
  get _formPaths() {
    return [...super._formPaths, "modification", "bonus"];
  }
}
