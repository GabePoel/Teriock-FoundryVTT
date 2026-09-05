import { RevitalizeActivation } from "../activations/command-activations.mjs";
import { StatAutomation } from "./abstract/_module.mjs";

export default class RevitalizeAutomation extends StatAutomation {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AUTOMATIONS.Revitalize"];

  /** @inheritDoc */
  static get metadata() {
    return Object.assign(super.metadata, { type: "revitalize" });
  }

  /** @inheritDoc */
  async _getActivations() {
    return [
      new RevitalizeActivation({
        options: { consumeStatDice: this.consumeStatDice, forHarm: this.forHarm, substitution: this.substitution },
      }),
    ];
  }

  /** @inheritDoc */
  canFire(trigger, scope) {
    return (this.actor?.system.isDrained || this.forHarm) && super.canFire(trigger, scope);
  }
}
