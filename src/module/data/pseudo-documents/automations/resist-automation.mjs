import { ResistHandler } from "../../../helpers/interaction/button-handlers/simple-command-handlers.mjs";
import BaseAutomation from "./base-automation.mjs";

const { fields } = foundry.data;

export default class ResistAutomation extends BaseAutomation {
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

  /** @inheritDoc */
  get buttons() {
    return [ResistHandler.buildButton(this.hex, this.threshold)];
  }
}
