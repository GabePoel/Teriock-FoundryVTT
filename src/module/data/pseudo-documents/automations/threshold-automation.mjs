import { FormulaField } from "../../fields/_module.mjs";
import BaseAutomation from "./base-automation.mjs";

export default class ThresholdAutomation extends BaseAutomation {
  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      bonus: new FormulaField({
        initial: "0",
        label: "Bonus",
        hint: "Formula that defines a bonus that gets added to the roll. Can be negative",
      }),
      threshold: new FormulaField({
        initial: null,
        nullable: true,
        label: "Threshold",
        hint: "Formula that defines the DC for this roll. Can be left blank.",
      }),
    });
  }

  /** @inheritDoc */
  get _formPaths() {
    return [...super._formPaths, "bonus", "threshold"];
  }
}
