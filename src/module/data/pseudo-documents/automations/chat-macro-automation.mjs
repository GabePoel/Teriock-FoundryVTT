import { mixClasses } from "../../../helpers/construction.mjs";
import { BaseAutomation } from "./abstract/_module.mjs";
import { MacroAutomationMixin } from "./mixins/_module.mjs";

export default class ChatMacroAutomation extends mixClasses(BaseAutomation, MacroAutomationMixin) {
  /** @inheritDoc */
  static get metadata() {
    return Object.assign(super.metadata, { type: "chatMacro" });
  }

  /** @inheritDoc */
  get _formPaths() {
    return [...this._macroPaths, "display.label"];
  }
}
