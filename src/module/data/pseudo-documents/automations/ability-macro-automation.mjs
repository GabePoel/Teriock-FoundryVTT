import { CritMechanicMixin } from "../mixins/_module.mjs";
import { BaseAutomation } from "./abstract/_module.mjs";
import * as automationMixins from "./mixins/_module.mjs";

/**
 * @extends {BaseAutomation}
 * @mixes CritMechanic
 * @mixes MacroAutomation
 */
export default class AbilityMacroAutomation
  extends automationMixins.MacroAutomationMixin(CritMechanicMixin(BaseAutomation))
{
  /** @inheritDoc */
  static get TYPE() {
    return "abilityMacro";
  }

  /** @inheritDoc */
  get canCrit() {
    return this.relation === "trigger" && super.canCrit;
  }
}
