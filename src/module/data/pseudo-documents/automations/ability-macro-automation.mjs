import CritAutomation from "./crit-automation.mjs";
import { MacroAutomationMixin } from "./mixins/_module.mjs";

//noinspection JSClosureCompilerSyntax
/**
 * @extends {CritAutomation}
 * @mixes MacroAutomation
 */
export default class AbilityMacroAutomation extends MacroAutomationMixin(
  CritAutomation,
) {
  /** @inheritDoc */
  static get TYPE() {
    return "abilityMacro";
  }

  /** @inheritDoc */
  get canCrit() {
    return this.relation === "trigger" && super.canCrit;
  }
}
