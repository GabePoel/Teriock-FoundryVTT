import { BaseAutomation } from "./abstract/_module.mjs";
import * as automationMixins from "./mixins/_module.mjs";

/**
 * @mixes MacroAutomation
 */
export default class CommonMacroAutomation extends automationMixins.MacroAutomationMixin(BaseAutomation) {
  /** @inheritDoc */
  static get TYPE() {
    return "commonMacro";
  }
}
