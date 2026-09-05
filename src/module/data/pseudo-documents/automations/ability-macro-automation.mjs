import { CritMechanicMixin } from "../mixins/_module.mjs";
import { BaseAutomation } from "./abstract/_module.mjs";
import * as automationMixins from "./mixins/_module.mjs";

/**
 * @mixes MacroAutomation
 * @mixes CritMechanic
 */
export default class AbilityMacroAutomation
  extends automationMixins.MacroAutomationMixin(CritMechanicMixin(BaseAutomation))
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
