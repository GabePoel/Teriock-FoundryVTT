import { mergeMetadata, mixClasses, omit } from "../../../../utils/_module.mjs";
import commandActivations from "../../activations/command-activations.mjs";
import { ThresholdAutomation } from "../abstract/_module.mjs";
import { TriggerAutomationMixin } from "../mixins/_module.mjs";

const { fields } = foundry.data;

/**
 * @extends {ThresholdAutomation}
 * @mixes TriggerAutomation
 */
export default class ResistAutomation extends mixClasses(ThresholdAutomation, TriggerAutomationMixin) {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AUTOMATIONS.Resist"];

  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, { type: "resist" });

  /** @inheritDoc */
  static defineSchema() {
    return omit(
      Object.assign(super.defineSchema(), { hex: new fields.BooleanField({ label: "TERIOCK.COMMON.Hexproof" }) }),
      ["threshold"],
    );
  }

  /** @inheritDoc */
  get _formPaths() {
    return ["hex", "circumstance", ...this._triggerDisplayPaths];
  }

  /** @inheritDoc */
  async _getActivations() {
    return [
      new commandActivations.resist({
        options: { circumstance: this.circumstance, type: this.hex ? "hexproof" : "resistance" },
      }),
    ];
  }
}
