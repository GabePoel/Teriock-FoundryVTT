import { EvaluationField } from "../../fields/_module.mjs";
import { changeModeField } from "../../fields/helpers/builders.mjs";
import { TimeUnitModel } from "../../models/unit-models/_module.mjs";
import { v14MigrateChangeMode } from "../../shared/migrations/migrate-changes.mjs";
import { CritAutomation } from "./abstract/_module.mjs";

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
      mode: changeModeField(),
    });
  }

  /** @inheritDoc */
  static migrateData(data) {
    if (data.mode) data.mode = v14MigrateChangeMode(data.mode);
    return super.migrateData(data);
  }

  /** @inheritDoc */
  get _formPaths() {
    return ["duration.unit", "duration.raw", "mode", ...super._formPaths];
  }
}
