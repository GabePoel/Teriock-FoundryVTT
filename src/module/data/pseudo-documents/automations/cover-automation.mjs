import { TakeCoverActivation, TakeUncoverActivation } from "../activations/command-activations.mjs";
import { BaseAutomation } from "./abstract/_module.mjs";

const { fields } = foundry.data;

export default class CoverAutomation extends BaseAutomation {
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
    return ["reverse"];
  }

  /** @inheritDoc */
  async getActivations() {
    if (this.reverse) { return [new TakeUncoverActivation()]; }
    return [new TakeCoverActivation()];
  }
}
