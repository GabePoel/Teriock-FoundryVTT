import { mixClasses } from "../../../../helpers/construction.mjs";
import { FormulaField, TernaryField } from "../../../fields/_module.mjs";
import { CritMechanicMixin, OverrideCompetenceMechanicMixin } from "../../mixins/_module.mjs";
import { BaseAutomation } from "../abstract/_module.mjs";
import * as automationMixins from "../mixins/_module.mjs";

const { fields } = foundry.data;

/**
 * @mixes CritMechanic
 * @mixes DisplayAutomation
 * @mixes OverrideDataAutomation
 * @mixes OverrideCompetenceMechanic
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
  static get _setCompetenceInitial() {
    return "inherit";
  }

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
      makeCritEffect: new TernaryField(),
      makeEffect: new TernaryField(),
      preventAttack: new fields.BooleanField({ initial: false }),
      preventBlockCone: new fields.BooleanField({ initial: false }),
      preventFeat: new fields.BooleanField({ initial: false }),
      preventThreshold: new fields.BooleanField({ initial: false }),
      rollBonus: new FormulaField({ deterministic: false, placeholder: "0" }),
      targetsActor: new TernaryField(),
      targetsArmament: new TernaryField(),
    });
  }

  /** @inheritDoc */
  get _formPaths() {
    return [
      "display.label",
      "makeEffect",
      "makeCritEffect",
      "targetsActor",
      "targetsArmament",
      "hr",
      "rollBonus",
      "hr",
      ...this._preventPaths,
      ...this._competencePaths,
      ...this._overrideDataPaths,
    ];
  }

  /**
   * Prevent fields relevant to the parent ability.
   * @returns {string[]}
   */
  get _preventPaths() {
    if (this.document?.type !== "ability") { return []; }
    const paths = [];
    if (this.document.system.interaction === "attack") { paths.push("preventAttack"); }
    if (this.document.system.interaction === "feat") { paths.push("preventFeat", "preventThreshold"); }
    if (this.document.system.delivery === "cone") { paths.push("preventBlockCone"); }
    if (paths.length) { paths.push("hr"); }
    return paths;
  }
}
