import { EvaluationField } from "../../fields/_module.mjs";
import { TimeUnitModel } from "../../models/unit-models/_module.mjs";
import CritAutomation from "./crit-automation.mjs";

const { fields } = foundry.data;

/**
 * @property {TimeUnitModel} duration
 * @property {number} mode
 */
export default class DurationAutomation extends CritAutomation {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "TERIOCK.AUTOMATIONS.DurationAutomation",
  ];

  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.AUTOMATIONS.DurationAutomation.LABEL";
  }

  /** @inheritDoc */
  static get TYPE() {
    return "duration";
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      duration: new EvaluationField({ model: TimeUnitModel }),
      mode: new fields.NumberField({
        choices: TERIOCK.options.effect.simpleChangeMode,
        initial: 5,
      }),
    });
  }

  /** @inheritDoc */
  get _formPaths() {
    return ["duration.unit", "duration.raw", "mode", ...super._formPaths];
  }
}
