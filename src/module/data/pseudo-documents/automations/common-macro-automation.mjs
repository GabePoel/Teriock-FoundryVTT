import { triggers } from "../../../constants/system/_module.mjs";
import { BaseAutomation } from "./abstract/_module.mjs";
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
  static get _triggerChoices() {
    return {
      execution: triggers.execution,
    };
  }
}
