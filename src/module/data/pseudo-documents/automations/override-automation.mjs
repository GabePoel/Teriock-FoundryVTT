import { mixClasses } from "../../../helpers/construction.mjs";
import { TernaryField } from "../../fields/_module.mjs";
import { migrateKey } from "../../shared/migrations/source-migrations.mjs";
import { CritAutomation } from "./abstract/_module.mjs";
import * as automationMixins from "./mixins/_module.mjs";

const { fields } = foundry.data;

/**
 * @extends {CritAutomation}
 * @mixes CompetenceAutomation
 * @mixes DisplayAutomation
 * @mixes OverrideDataAutomation
 */
export default class OverrideAutomation
  extends mixClasses(
    CritAutomation,
    automationMixins.DisplayAutomationMixin,
    automationMixins.OverrideDataAutomationMixin,
    automationMixins.CompetenceAutomationMixin,
  )
{
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AUTOMATIONS.Override"];

  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.AUTOMATIONS.Override.LABEL";
  }

  /** @inheritDoc */
  static get TYPE() {
    return "override";
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      makeEffect: new TernaryField(),
      preventFeat: new fields.BooleanField({ initial: false }),
      preventThreshold: new fields.BooleanField({ initial: false }),
      targetsActor: new TernaryField(),
      targetsArmament: new TernaryField(),
    });
  }

  /** @inheritDoc */
  static migrateData(source, options, state) {
    migrateKey(source, "prevent", "preventEffect");
    migrateKey(source, "preventEffect", "makeEffect", v => v === true ? false : null);
    return super.migrateData(source, options, state);
  }

  /** @inheritDoc */
  get _formPaths() {
    return [
      "display.label",
      "makeEffect",
      "targetsActor",
      "targetsArmament",
      "hr",
      "preventFeat",
      "preventThreshold",
      ...this._competencePaths,
      ...this._overrideDataPaths,
    ];
  }
}
