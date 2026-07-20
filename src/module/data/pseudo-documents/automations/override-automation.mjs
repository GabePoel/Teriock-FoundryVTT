import { mixClasses } from "../../../helpers/construction.mjs";
import { FormulaField, TernaryField } from "../../fields/_module.mjs";
import { migrateKey } from "../../migrations/source-migrations.mjs";
import { CritMechanicMixin, OverrideCompetenceMechanicMixin } from "../mixins/_module.mjs";
import { BaseAutomation } from "./abstract/_module.mjs";
import * as automationMixins from "./mixins/_module.mjs";

const { fields } = foundry.data;

/**
 * @extends {BaseAutomation}
 * @mixes CritMechanic
 * @mixes DisplayAutomation
 * @mixes OverrideCompetenceMechanic
 * @mixes OverrideDataAutomation
 * @property {Teriock.System.FormulaString} rollBonus
 * @property {boolean|null} makeEffect
 * @property {boolean|null} targetsActor
 * @property {boolean|null} targetsArmament
 * @property {boolean} preventFeat
 * @property {boolean} preventThreshold
 */
export default class OverrideAutomation
  extends mixClasses(
    CritMechanicMixin(BaseAutomation),
    automationMixins.DisplayAutomationMixin,
    automationMixins.OverrideDataAutomationMixin,
    OverrideCompetenceMechanicMixin,
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
      rollBonus: new FormulaField({ deterministic: false }),
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
      "rollBonus",
      "hr",
      "preventFeat",
      "preventThreshold",
      ...this._competencePaths,
      ...this._overrideDataPaths,
    ];
  }
}
