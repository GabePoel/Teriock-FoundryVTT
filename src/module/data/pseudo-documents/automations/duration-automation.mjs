import { EvaluationField, FormulaField } from "../../fields/_module.mjs";
import { TimeUnitModel } from "../../models/unit-models/_module.mjs";
import { CritMechanicMixin } from "../mixins/_module.mjs";
import { BaseAutomation } from "./abstract/_module.mjs";

/**
 * @property {TimeUnitModel} duration
 * @property {Teriock.System.FormulaString} substitution
 */
export default class DurationAutomation extends CritMechanicMixin(BaseAutomation) {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AUTOMATIONS.Duration"];

  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.AUTOMATIONS.Duration.LABEL";
  }

  /** @inheritDoc */
  static get TYPE() {
    return "duration";
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      duration: new EvaluationField({ model: TimeUnitModel }),
      substitution: new FormulaField({ initial: "@base + @new" }),
    });
  }

  /** @inheritDoc */
  get _formPaths() {
    return ["duration.unit", "duration.raw", "substitution", ...super._formPaths];
  }
}
