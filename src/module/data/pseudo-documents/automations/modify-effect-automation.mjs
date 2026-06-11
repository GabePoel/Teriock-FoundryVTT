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
export default class ModifyEffectAutomation
  extends mixClasses(
    CritAutomation,
    automationMixins.DisplayAutomationMixin,
    automationMixins.OverrideDataAutomationMixin,
    automationMixins.CompetenceAutomationMixin,
  )
{
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
      makeEffect: new TernaryField(),
      preventFeat: new fields.BooleanField({ initial: false }),
      preventThreshold: new fields.BooleanField({ initial: false }),
    });
  }

  /** @inheritDoc */
  static migrateData(source, options, state) {
    migrateKey(source, "prevent", "preventEffect");
    migrateKey(source, "preventEffect", "makeEffect", v => v === true ? false : v);
    return super.migrateData(source, options, state);
  }

  /** @inheritDoc */
  get _formPaths() {
    return [
      "display.label",
      "makeEffect",
      "preventFeat",
      "preventThreshold",
      ...this._competencePaths,
      ...this._overrideDataPaths,
    ];
  }
}
