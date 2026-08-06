import { rollableFormulaField } from "../../../fields/tools/builders.mjs";
import { CritMechanicMixin } from "../../mixins/_module.mjs";
import * as automationMixins from "../mixins/_module.mjs";
import BaseAutomation from "./base-automation.mjs";

const { fields } = foundry.data;

/**
 * @extends {BaseAutomation}
 * @mixes TriggerAutomation
 * @mixes CritMechanic
 * @param {boolean} consumeStatDice
 * @param {boolean} forHarm
 * @param {Teriock.System.FormulaString} substitution
 */
export default class StatAutomation extends automationMixins.TriggerAutomationMixin(CritMechanicMixin(BaseAutomation)) {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AUTOMATIONS.Stat"];

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      consumeStatDice: new fields.BooleanField({ initial: true }),
      forHarm: new fields.BooleanField({ initial: false }),
      substitution: rollableFormulaField({ placeholder: "@base" }),
    });
  }

  /** @inheritDoc */
  get _formPaths() {
    return ["consumeStatDice", "forHarm", "substitution", ...super._formPaths];
  }
}
