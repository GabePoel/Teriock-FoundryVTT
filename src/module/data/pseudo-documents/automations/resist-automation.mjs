import { ResistHandler } from "../../../helpers/interaction/button-handlers/simple-command-handlers.mjs";
import ThresholdAutomation from "./threshold-automation.mjs";

const { fields } = foundry.data;

export default class ResistAutomation extends ThresholdAutomation {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "TERIOCK.AUTOMATIONS.ResistAutomation",
  ];

  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.ROLLS.Resist.label";
  }

  /** @inheritDoc */
  static get TYPE() {
    return "resist";
  }

  /** @inheritDoc */
  static defineSchema() {
    const schema = Object.assign(super.defineSchema(), {
      hex: new fields.BooleanField({
        label: "TERIOCK.TERMS.Common.hexproof",
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
