import { mixClasses } from "../../../helpers/construction.mjs";
import { CritMechanicMixin } from "../mixins/_module.mjs";
import { BaseAutomation } from "./abstract/_module.mjs";
import { MacroAutomationMixin } from "./mixins/_module.mjs";

/**
 * @mixes MacroAutomation
 * @mixes CritMechanic
 */
export default class AbilityMacroAutomation
  extends mixClasses(BaseAutomation, CritMechanicMixin, MacroAutomationMixin)
{
  /** @inheritDoc */
  static get metadata() {
    return Object.assign(super.metadata, { type: "abilityMacro" });
  }

  /** @inheritDoc */
  get canCrit() {
    return this.relation === "trigger" && super.canCrit;
  }
}
