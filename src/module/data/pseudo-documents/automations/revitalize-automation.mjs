import { RevitalizeHandler } from "../../../helpers/interaction/button-handlers/simple-command-handlers.mjs";
import StatAutomation from "./stat-automation.mjs";

export default class RevitalizeAutomation extends StatAutomation {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "TERIOCK.AUTOMATIONS.RevitalizeAutomation",
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
  get _buttons() {
    return [
      RevitalizeHandler.buildButton({
        consumeStatDice: this.consumeStatDice,
        forHarm: this.forHarm,
      }),
    ];
  }

  /** @inheritDoc */
  async _preFire() {
    if (!this.actor.isDrained || this.forHarm) return;
    this.document.actor.system
      .takeRevitalize({
        consumeStatDice: this.consumeStatDice,
        forHarm: this.forHarm,
        title: this.document.nameString,
      })
      .then();
  }
}
