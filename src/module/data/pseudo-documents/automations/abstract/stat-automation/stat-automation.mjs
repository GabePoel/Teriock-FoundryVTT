import { mixClasses } from "../../../../../helpers/construction.mjs";
import { rollableFormulaField } from "../../../../fields/tools/builders.mjs";
import { CritMechanicMixin } from "../../../mixins/_module.mjs";
import { TriggerAutomationMixin } from "../../mixins/_module.mjs";
import BaseAutomation from "../base-automation/base-automation.mjs";

const { fields } = foundry.data;

/**
 * @mixes TriggerAutomation
 * @mixes CritMechanic
 * @param {boolean} consumeStatDice
 * @param {boolean} forHarm
 * @param {Teriock.System.FormulaString} substitution
 */
export default class StatAutomation
  extends mixClasses(BaseAutomation, CritMechanicMixin, TriggerAutomationMixin)
{
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
