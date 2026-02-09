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
  static get LABEL() {
    return "Duration";
  }

  /** @inheritDoc */
  static get TYPE() {
    return "duration";
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      duration: new EvaluationField({
        model: TimeUnitModel,
        label: "Formula",
        hint: "A formula that evaluates to a number of the specified unit.",
      }),
      mode: new fields.NumberField({
        choices: TERIOCK.options.effect.simpleChangeMode,
        hint: "The arithmetic operation to apply to this effect's duration.",
        initial: 5,
        label: "Mode",
      }),
    });
  }

  /** @inheritDoc */
  get _formPaths() {
    return ["duration.unit", "duration.raw", "mode", ...super._formPaths];
  }
}
