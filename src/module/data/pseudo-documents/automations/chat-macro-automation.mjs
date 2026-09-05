import { omit } from "../../../helpers/utils.mjs";
import { BaseAutomation } from "./abstract/_module.mjs";
import * as automationMixins from "./mixins/_module.mjs";

export default class ChatMacroAutomation extends automationMixins.MacroAutomationMixin(BaseAutomation) {
  /** @inheritDoc */
  static get metadata() {
    return Object.assign(super.metadata, { type: "chatMacro" });
  }

  /** @inheritDoc */
  static defineSchema() {
    return omit(super.defineSchema(), ["relation", "trigger"]);
  }

  /** @inheritDoc */
  get _formPaths() {
    return [...this._macroPaths, "display.label"];
  }

  /**
   * Getter that replaces the optional relation data.
   * @return {string}
   */
  get relation() {
    return "button";
  }
}
