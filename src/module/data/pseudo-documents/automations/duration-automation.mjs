import BaseAutomation from "./base-automation.mjs";

const { fields } = foundry.data;

/**
 * @property {number} duration
 */
export default class DurationAutomation extends BaseAutomation {
  /** @inheritDoc */
  static get TYPE() {
    return "duration";
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      duration: new fields.NumberField({
        initial: 0,
        label: "Formula",
        hint: "A custom formula to replace this ability's default duration.",
      }),
    });
  }

  /** @inheritDoc */
  get _formPaths() {
    return ["duration"];
  }
}
