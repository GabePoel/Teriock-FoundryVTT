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
  get buttons() {
    return [
      RevitalizeHandler.buildButton({
        consumeStatDice: this.consumeStatDice,
        forHarm: this.forHarm,
      }),
    ];
  }
}
