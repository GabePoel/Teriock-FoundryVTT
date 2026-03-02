import { pseudoHooks } from "../../../constants/system/_module.mjs";
import BaseAutomation from "./base-automation.mjs";
import { MacroAutomationMixin } from "./mixins/_module.mjs";

//noinspection JSClosureCompilerSyntax
/**
 * @extends {BaseAutomation}
 * @mixes MacroAutomation
 */
export default class PropertyMacroAutomation extends MacroAutomationMixin(
  BaseAutomation,
) {
  /** @inheritDoc */
  static get TYPE() {
    return "propertyMacro";
  }

  /** @inheritDoc */
  static get _triggerChoices() {
    return pseudoHooks.property;
  }
}
