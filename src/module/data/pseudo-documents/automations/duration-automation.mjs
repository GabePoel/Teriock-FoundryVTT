import { EvaluationField } from "../../fields/_module.mjs";
import { changeTypeField } from "../../fields/helpers/builders.mjs";
import { TimeUnitModel } from "../../models/unit-models/_module.mjs";
import { migrateChangeType } from "../../shared/migrations/change-migrations.mjs";
import { CritAutomation } from "./abstract/_module.mjs";

/**
 * @property {TimeUnitModel} duration
 * @property {string} changeType
 */
export default class DurationAutomation extends CritAutomation {
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
      changeType: changeTypeField(),
      duration: new EvaluationField({ model: TimeUnitModel }),
    });
  }

  /** @inheritDoc */
  static migrateData(source, options, state) {
    migrateChangeType(source, "changeType");
    return super.migrateData(source, options, state);
  }

  /** @inheritDoc */
  get _formPaths() {
    return ["duration.unit", "duration.raw", "changeType", ...super._formPaths];
  }
}
