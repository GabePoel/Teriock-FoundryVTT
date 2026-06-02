import { omit } from "../../../helpers/utils.mjs";
import { ResistActivation } from "../activations/command-activations.mjs";
import { ThresholdAutomation } from "./abstract/_module.mjs";

const { fields } = foundry.data;

export default class ResistAutomation extends ThresholdAutomation {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AUTOMATIONS.Resist"];

  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.TERMS.EffectTypes.resistance";
  }

  /** @inheritDoc */
  static get TYPE() {
    return "resist";
  }

  /** @inheritDoc */
  static defineSchema() {
    return omit(
      Object.assign(super.defineSchema(), { hex: new fields.BooleanField({ label: "TERIOCK.TERMS.Common.hexproof" }) }),
      ["threshold"],
    );
  }

  /** @inheritDoc */
  get _formPaths() {
    return ["hex", "bonus"];
  }

  /** @inheritDoc */
  async getActivations() {
    return [new ResistActivation({ options: { bonus: this.bonus, hex: this.hex } })];
  }
}
