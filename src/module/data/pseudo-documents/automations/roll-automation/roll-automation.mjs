import { mixClasses } from "../../../../helpers/construction.mjs";
import { localizeChoices } from "../../../../helpers/localization.mjs";
import { objectMap } from "../../../../helpers/utils.mjs";
import FormulaField from "../../../fields/formula-field.mjs";
import { RollActivation } from "../../activations/_module.mjs";
import { CritMechanicMixin } from "../../mixins/_module.mjs";
import { BaseAutomation } from "../abstract/_module.mjs";
import * as automationMixins from "../mixins/_module.mjs";

const { fields } = foundry.data;

/**
 * @mixes CritMechanic
 * @mixes DisplayAutomation
 * @mixes TriggerAutomation
 */
export default class RollAutomation
  extends mixClasses(
    CritMechanicMixin(BaseAutomation),
    automationMixins.DisplayAutomationMixin,
    automationMixins.TriggerAutomationMixin,
  )
{
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AUTOMATIONS.Roll"];

  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.AUTOMATIONS.Roll.LABEL";
  }

  /** @inheritDoc */
  static get TYPE() {
    return "roll";
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      formula: new FormulaField({ deterministic: false, nullable: true, placeholder: _loc("COMMON.None") }),
      impact: new fields.StringField({
        choices: localizeChoices(objectMap(TERIOCK.config.impact, i => i.deal)),
        initial: "damage",
        nullable: false,
        required: true,
      }),
    });
  }

  /** @inheritDoc */
  get _formPaths() {
    return ["impact", "formula", "hr", ...this._triggerDisplayPaths];
  }

  /** @inheritDoc */
  async _getActivations(options = {}) {
    const formula = options?.execution?._heightenString?.(this.formula) ?? this.formula;
    if (formula && this.impact) {
      return [new RollActivation({ display: this.display, formula, impact: this.impact })];
    }
    return [];
  }
}
