import { commonPseudoHooks } from "../../../constants/system/pseudo-hooks.mjs";
import BaseAutomation from "./base-automation.mjs";
import { MacroAutomationMixin } from "./mixins/_module.mjs";

//noinspection JSClosureCompilerSyntax
/**
 * @extends {BaseAutomation}
 * @mixes MacroAutomation
 */
export default class CommonMacroAutomation extends MacroAutomationMixin(
  BaseAutomation,
) {
  /** @inheritDoc */
  static get TYPE() {
    return "commonMacro";
  }

  /** @inheritDoc */
  static get _pseudoHookChoices() {
    return commonPseudoHooks;
  }
}
