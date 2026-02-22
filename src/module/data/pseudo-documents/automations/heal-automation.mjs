import { HealHandler } from "../../../helpers/interaction/button-handlers/simple-command-handlers.mjs";
import StatAutomation from "./stat-automation.mjs";

const { fields } = foundry.data;

/**
 * @param {boolean} noStatDice
 */
export default class HealAutomation extends StatAutomation {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "TERIOCK.AUTOMATIONS.HealAutomation",
  ];

  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.EFFECTS.Common.heal";
  }

  /** @inheritDoc */
  static get TYPE() {
    return "heal";
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      noStatDice: new fields.BooleanField({ initial: false }),
    });
  }

  /** @inheritDoc */
  get _formPaths() {
    const paths = this.noStatDice ? [] : super._formPaths;
    return [...paths, "noStatDice"];
  }

  /** @inheritDoc */
  get buttons() {
    return [
      HealHandler.buildButton({
        consumeStatDice: this.consumeStatDice,
        forHarm: this.forHarm,
        noStatDice: this.noStatDice,
      }),
    ];
  }
}
