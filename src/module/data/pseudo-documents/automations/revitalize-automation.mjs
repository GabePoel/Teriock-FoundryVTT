import { mergeMetadata } from "../../../utils/_module.mjs";
import commandActivations from "../activations/command-activations.mjs";
import { StatAutomation } from "./abstract/_module.mjs";

export default class RevitalizeAutomation extends StatAutomation {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AUTOMATIONS.Revitalize"];

  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, { type: "revitalize" });

  /** @inheritDoc */
  async _getActivations() {
    return [
      new commandActivations.revitalize({
        options: { consumeStatDice: this.consumeStatDice, forHarm: this.forHarm, substitution: this.substitution },
      }),
    ];
  }

  /** @inheritDoc */
  validateTrigger(trigger, scope) {
    return (this.actor?.system.isDrained || this.forHarm) && super.validateTrigger(trigger, scope);
  }
}
