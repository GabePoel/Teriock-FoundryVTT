import { omit } from "../../../helpers/utils.mjs";
import { BaseAutomation } from "./abstract/_module.mjs";
import * as automationMixins from "./mixins/_module.mjs";

export default class ChatMacroAutomation extends automationMixins.MacroAutomationMixin(BaseAutomation) {
  /** @inheritDoc */
  static get TYPE() {
    return "chatMacro";
  }

  /** @inheritDoc */
  static defineSchema() {
    return omit(super.defineSchema(), ["relation", "trigger"]);
  }

  /** @inheritDoc */
  get _formPaths() {
    return ["macro", "display.label"];
  }

  /**
   * Getter that replaces the optional relation data.
   * @return {string}
   */
  get relation() {
    return "button";
  }
}
