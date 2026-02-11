import { ResistHandler } from "../../../helpers/interaction/button-handlers/simple-command-handlers.mjs";
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
    const schema = Object.assign(super.defineSchema(), {
      hex: new fields.BooleanField({
        label: "Hexproof",
        hint: "Whether this is a hexproof roll.",
      }),
    });
    delete schema.threshold;
    return schema;
  }

  /** @inheritDoc */
  get _formPaths() {
    return ["hex", "bonus"];
  }

  /** @inheritDoc */
  get buttons() {
    return [
      ResistHandler.buildButton({
        bonus: this.bonus,
        hex: this.hex,
      }),
    ];
  }
}
