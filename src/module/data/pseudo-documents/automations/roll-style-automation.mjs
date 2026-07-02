import { defaultJSONField } from "../../fields/tools/builders.mjs";
import { BaseAutomation } from "./abstract/_module.mjs";

/**
 * @property {object} sfx
 * @property {object} style
 */
export default class RollStyleAutomation extends BaseAutomation {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AUTOMATIONS.RollStyle"];

  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.AUTOMATIONS.RollStyle.LABEL";
  }

  /** @inheritDoc */
  static get TYPE() {
    return "rollStyle";
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), { sfx: defaultJSONField(), style: defaultJSONField() });
  }

  /** @inheritDoc */
  get _formPaths() {
    return ["style", "sfx", ...super._formPaths];
  }

  /** @inheritDoc */
  get formTips() {
    const tips = super.formTips;
    if (!game.modules.get("dice-so-nice")?.active) {
      tips.unshift({ level: "error", text: "TERIOCK.AUTOMATIONS.RollStyle.NOTIFICATIONS.DsnRequired" });
    }
    return tips;
  }
}
