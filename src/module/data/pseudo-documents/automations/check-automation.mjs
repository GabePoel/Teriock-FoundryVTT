import ThresholdAutomation from "./threshold-automation.mjs";

const { fields } = foundry.data;

export default class CheckAutomation extends ThresholdAutomation {
  /** @inheritDoc */
  static get LABEL() {
    return "Tradecraft Check";
  }

  /** @inheritDoc */
  static get TYPE() {
    return "check";
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      check: new fields.StringField({
        choices: TERIOCK.index.tradecrafts,
        label: "Tradecraft",
      }),
    });
  }

  /** @inheritDoc */
  get _formPaths() {
    return ["check", ...super._formPaths];
  }
}
