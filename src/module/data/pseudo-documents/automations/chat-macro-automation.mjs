import { BaseAutomation } from "./_module.mjs";
import { MacroAutomationMixin } from "./mixins/_module.mjs";

export default class ChatMacroAutomation extends MacroAutomationMixin(
  BaseAutomation,
) {
  /** @inheritDoc */
  static get TYPE() {
    return "chatMacro";
  }

  /** @inheritDoc */
  static get _pseudoHookChoices() {
    return {};
  }

  /** @inheritDoc */
  get _formPaths() {
    return ["macro", "title"];
  }
}
