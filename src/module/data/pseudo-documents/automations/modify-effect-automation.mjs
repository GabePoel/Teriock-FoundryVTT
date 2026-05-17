import { mixClasses } from "../../../helpers/construction.mjs";
import { migrateKey } from "../../shared/migrations/source-migrations.mjs";
import { CritAutomation } from "./abstract/_module.mjs";
import { CompetenceAutomationMixin, DisplayAutomationMixin, OverrideDataAutomationMixin } from "./mixins/_module.mjs";

const { fields } = foundry.data;

/**
 * @extends {CritAutomation}
 * @mixes CompetenceAutomation
 * @mixes DisplayAutomation
 * @mixes OverrideDataAutomation
 */
export default class ModifyEffectAutomation extends mixClasses(
  CritAutomation,
  DisplayAutomationMixin,
  OverrideDataAutomationMixin,
  CompetenceAutomationMixin,
) {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AUTOMATIONS.ModifyEffect"];

  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.AUTOMATIONS.ModifyEffect.LABEL";
  }

  /** @inheritDoc */
  static get TYPE() {
    return "modifyEffect";
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      preventEffect: new fields.BooleanField({ initial: false }),
      preventFeat: new fields.BooleanField({ initial: false }),
      preventThreshold: new fields.BooleanField({ initial: false }),
    });
  }

  /** @inheritDoc */
  static migrateData(source, options, state) {
    migrateKey(source, "prevent", "preventEffect");
    return super.migrateData(source, options, state);
  }

  /** @inheritDoc */
  get _formPaths() {
    return [
      "display.label",
      "preventFeat",
      "preventEffect",
      "preventThreshold",
      ...this._competencePaths,
      ...this._overrideDataPaths,
    ];
  }
}
