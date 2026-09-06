import { mixClasses } from "../../../helpers/construction.mjs";
import { BaseAutomation } from "./abstract/_module.mjs";
import { MacroAutomationMixin } from "./mixins/_module.mjs";

/**
 * @mixes MacroAutomation
 */
export default class CommonMacroAutomation extends mixClasses(BaseAutomation, MacroAutomationMixin) {
  /** @inheritDoc */
  static get metadata() {
    return Object.assign(super.metadata, { type: "commonMacro" });
  }
}
