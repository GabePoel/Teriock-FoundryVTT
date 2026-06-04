import { RevitalizeActivation } from "../activations/command-activations.mjs";
import { StatAutomation } from "./abstract/_module.mjs";

export default class RevitalizeAutomation extends StatAutomation {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AUTOMATIONS.Revitalize"];

  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.EFFECTS.Common.revitalize";
  }

  /** @inheritDoc */
  static get TYPE() {
    return "revitalize";
  }

  /** @inheritDoc */
  async _getActivations() {
    return [new RevitalizeActivation({ options: { consumeStatDice: this.consumeStatDice, forHarm: this.forHarm } })];
  }

  /** @inheritDoc */
  canFire(trigger) {
    return (this.actor?.isDrained || this.forHarm) && super.canFire(trigger);
  }
}
