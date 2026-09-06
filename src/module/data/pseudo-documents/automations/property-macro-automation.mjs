import { mixClasses } from "../../../helpers/construction.mjs";
import { BaseAutomation } from "./abstract/_module.mjs";
import { MacroAutomationMixin } from "./mixins/_module.mjs";

/**
 * @mixes MacroAutomation
 */
export default class PropertyMacroAutomation extends mixClasses(BaseAutomation, MacroAutomationMixin) {
  /** @inheritDoc */
  static get metadata() {
    return Object.assign(super.metadata, { type: "propertyMacro" });
  }

  /** @inheritDoc */
  get triggerMetadata() {
    return foundry.utils.mergeObject(super.triggerMetadata, {
      choices: { attunable: TERIOCK.config.trigger.attunable, equipment: TERIOCK.config.trigger.equipment },
    });
  }
}
