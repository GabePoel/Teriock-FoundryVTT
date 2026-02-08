import ThresholdAutomation from "./threshold-automation.mjs";

const { fields } = foundry.data;

export default class ResistAutomation extends ThresholdAutomation {
  /** @inheritDoc */
  static get LABEL() {
    return "Resistance Save";
  }

  /** @inheritDoc */
  static get TYPE() {
    return "resist";
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      hex: new fields.BooleanField({
        label: "Hexproof",
        hint: "Whether this is a hexproof roll.",
      }),
    });
  }

  /** @inheritDoc */
  get _formPaths() {
    return [...super._formPaths, "hex"];
  }
}
