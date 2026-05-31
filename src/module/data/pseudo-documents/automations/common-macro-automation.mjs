import { BaseAutomation } from "./abstract/_module.mjs";
import * as automationMixins from "./mixins/_module.mjs";

/**
 * @extends {BaseAutomation}
 * @mixes MacroAutomation
 */
export default class CommonMacroAutomation extends automationMixins.MacroAutomationMixin(BaseAutomation) {
  /** @inheritDoc */
  static get triggerMetadata() {
    return Object.assign(super.triggerMetadata, { executionOnly: true });
  }

  /** @inheritDoc */
  static get TYPE() {
    return "commonMacro";
  }
}
