import { BaseAutomation } from "./abstract/_module.mjs";
import { MacroAutomationMixin } from "./mixins/_module.mjs";

/**
 * @extends {BaseAutomation}
 * @mixes MacroAutomation
 */
export default class PropertyMacroAutomation extends MacroAutomationMixin(BaseAutomation) {
  /** @inheritDoc */
  static get TYPE() {
    return "propertyMacro";
  }

  /** @inheritDoc */
  static get _triggerChoices() {
    return {
      ...super._triggerChoices,
      attunable: TERIOCK.config.trigger.attunable,
      equipment: TERIOCK.config.trigger.equipment,
    };
  }
}
