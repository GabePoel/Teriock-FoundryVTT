import { FormulaField } from "../../fields/_module.mjs";
import BaseAutomation from "./base-automation.mjs";

export default class ThresholdAutomation extends BaseAutomation {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "TERIOCK.AUTOMATIONS.ThresholdAutomation",
  ];

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      bonus: new FormulaField({ initial: "0" }),
      threshold: new FormulaField({
        initial: null,
        nullable: true,
      }),
    });
  }

  /** @inheritDoc */
  get _formPaths() {
    return [...super._formPaths, "bonus", "threshold"];
  }
}
