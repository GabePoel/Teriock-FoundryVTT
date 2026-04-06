import { RevitalizeActivation } from "../activations/command-activations.mjs";
import { StatAutomation } from "./abstract/_module.mjs";

export default class RevitalizeAutomation extends StatAutomation {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "TERIOCK.AUTOMATIONS.Revitalize",
  ];

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
    return [
      new RevitalizeActivation({
        options: {
          consumeStatDice: this.consumeStatDice,
          forHarm: this.forHarm,
        },
      }),
    ];
  }

  /** @inheritDoc */
  async _preFire() {
    if (!this.actor.isDrained || this.forHarm) return;
    this.document.actor.system.takeRevitalize({
      consumeStatDice: this.consumeStatDice,
      forHarm: this.forHarm,
      title: this.document.fullName,
    });
  }
}
