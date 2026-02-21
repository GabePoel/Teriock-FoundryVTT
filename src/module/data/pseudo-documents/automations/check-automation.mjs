import { TradecraftCheckHandler } from "../../../helpers/interaction/button-handlers/simple-command-handlers.mjs";
import ThresholdAutomation from "./threshold-automation.mjs";

const { fields } = foundry.data;

export default class CheckAutomation extends ThresholdAutomation {
  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.ROLLS.Tradecraft.label";
  }

  /** @inheritDoc */
  static get TYPE() {
    return "check";
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      tradecraft: new fields.StringField({
        choices: TERIOCK.reference.tradecrafts,
        label: "TERIOCK.TERMS.Common.tradecraft",
      }),
    });
  }

  /** @inheritDoc */
  get _formPaths() {
    return ["tradecraft", ...super._formPaths];
  }

  /** @inheritDoc */
  get buttons() {
    return [
      TradecraftCheckHandler.buildButton(this.tradecraft, {
        bonus: this.bonus,
        threshold: this.threshold,
      }),
    ];
  }
}
