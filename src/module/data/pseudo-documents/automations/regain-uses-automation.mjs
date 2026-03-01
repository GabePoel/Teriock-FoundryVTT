import { timeOptions } from "../../../constants/options/time-options.mjs";
import { FormulaField } from "../../fields/_module.mjs";
import BaseAutomation from "./base-automation.mjs";

const { fields } = foundry.data;

/**
 * @property {Teriock.System.FormulaString} formula
 * @property {Teriock.System.TimeTrigger} trigger
 */
export default class RegainUsesAutomation extends BaseAutomation {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "TERIOCK.AUTOMATIONS.RegainUsesAutomation",
  ];

  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.AUTOMATIONS.RegainUsesAutomation.LABEL";
  }

  /** @inheritDoc */
  static get TYPE() {
    return "regain";
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      formula: new FormulaField({
        deterministic: false,
      }),
      trigger: new fields.StringField({
        choices: timeOptions.triggers,
      }),
    });
  }

  /** @inheritDoc */
  get _formPaths() {
    return ["trigger", "formula"];
  }
}
