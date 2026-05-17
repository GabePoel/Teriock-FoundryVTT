import { BaseAutomation } from "./abstract/_module.mjs";
import { MacroAutomationMixin } from "./mixins/_module.mjs";

export default class ChatMacroAutomation extends MacroAutomationMixin(BaseAutomation) {
  /** @inheritDoc */
  static get TYPE() {
    return "chatMacro";
  }

  /** @inheritDoc */
  static defineSchema() {
    const schema = super.defineSchema();
    delete schema.relation;
    delete schema.trigger;
    return schema;
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
