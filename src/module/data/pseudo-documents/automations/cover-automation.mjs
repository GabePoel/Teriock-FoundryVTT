import { mixClasses } from "../../../helpers/construction.mjs";
import { TakeCoverActivation, TakeUncoverActivation } from "../activations/command-activations.mjs";
import { CritMechanicMixin } from "../mixins/_module.mjs";
import { BaseAutomation } from "./abstract/_module.mjs";
import * as automationMixins from "./mixins/_module.mjs";

const { fields } = foundry.data;

/**
 * @mixes CritMechanic
 * @mixes TriggerAutomation
 */
export default class CoverAutomation
  extends mixClasses(BaseAutomation, CritMechanicMixin, automationMixins.TriggerAutomationMixin)
{
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AUTOMATIONS.Cover"];

  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.AUTOMATIONS.Cover.LABEL";
  }

  /** @inheritDoc */
  static get TYPE() {
    return "cover";
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), { reverse: new fields.BooleanField() });
  }

  /** @inheritDoc */
  get _formPaths() {
    return ["reverse", ...super._formPaths];
  }

  /** @inheritDoc */
  async _getActivations() {
    if (this.reverse) { return [new TakeUncoverActivation()]; }
    return [new TakeCoverActivation()];
  }
}
