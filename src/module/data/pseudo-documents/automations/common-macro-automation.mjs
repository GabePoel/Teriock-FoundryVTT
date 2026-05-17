import { BaseAutomation } from "./abstract/_module.mjs";
import { MacroAutomationMixin } from "./mixins/_module.mjs";

/**
 * @extends {BaseAutomation}
 * @mixes MacroAutomation
 */
export default class CommonMacroAutomation extends MacroAutomationMixin(BaseAutomation) {
  /** @inheritDoc */
  static get _triggerChoices() {
    return { execution: TERIOCK.config.trigger.execution };
  }

  /** @inheritDoc */
  static get TYPE() {
    return "commonMacro";
  }
}
