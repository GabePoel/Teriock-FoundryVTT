import { abilityPseudoHooks } from "../../../constants/system/pseudo-hooks.mjs";
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
  static get _pseudoHookChoices() {
    return abilityPseudoHooks;
  }

  /** @inheritDoc */
  get canCrit() {
    return this.relation === "pseudoHook" && super.canCrit;
  }
}
