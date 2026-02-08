import ThresholdAutomation from "./threshold-automation.mjs";

const { fields } = foundry.data;

export default class FeatAutomation extends ThresholdAutomation {
  /** @inheritDoc */
  static get TYPE() {
    return "feat";
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      feat: new fields.StringField({
        choices: TERIOCK.index.attributesFull,
        label: "Attribute",
      }),
    });
  }

  /** @inheritDoc */
  get _formPaths() {
    return ["feat", ...super._formPaths];
  }
}
