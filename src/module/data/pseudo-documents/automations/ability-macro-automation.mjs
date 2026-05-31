import { CritAutomation } from "./abstract/_module.mjs";
import * as automationMixins from "./mixins/_module.mjs";

/**
 * @extends {CritAutomation}
 * @mixes MacroAutomation
 */
export default class AbilityMacroAutomation extends automationMixins.MacroAutomationMixin(CritAutomation) {
  /** @inheritDoc */
  static get TYPE() {
    return "abilityMacro";
  }

  /** @inheritDoc */
  get canCrit() {
    return this.relation === "trigger" && super.canCrit;
  }
}
