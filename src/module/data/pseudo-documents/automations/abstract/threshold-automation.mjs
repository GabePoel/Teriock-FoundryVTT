import { FormulaField } from "../../../fields/_module.mjs";
import { rollableFormulaField } from "../../../fields/helpers/builders.mjs";
import BaseAutomation from "./base-automation.mjs";

export default class ThresholdAutomation extends BaseAutomation {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "TERIOCK.AUTOMATIONS.Threshold",
  ];

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      bonus: rollableFormulaField(),
      threshold: new FormulaField({ initial: null, nullable: true }),
    });
  }

  /** @inheritDoc */
  get _formPaths() {
    return [...super._formPaths, "bonus", "threshold"];
  }
}
