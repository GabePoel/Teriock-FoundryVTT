import { defaultJSONField } from "../../../fields/tools/builders.mjs";
import { BaseAutomation } from "../abstract/_module.mjs";

export default class RollStyleAutomation extends BaseAutomation {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AUTOMATIONS.RollStyle"];

  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.AUTOMATIONS.RollStyle.LABEL";
  }

  /** @inheritDoc */
  static get metadata() {
    return Object.assign(super.metadata, { type: "rollStyle" });
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

  /** @inheritDoc */
  _makeFormGroup(path, groupConfig = {}, inputConfig = {}, config = {}) {
    if (["sfx", "style"].includes(path)) { groupConfig.stacked = true; }
    return super._makeFormGroup(path, groupConfig, inputConfig, config);
  }
}
