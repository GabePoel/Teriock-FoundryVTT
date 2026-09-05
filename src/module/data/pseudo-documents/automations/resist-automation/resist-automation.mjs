import { mixClasses } from "../../../../helpers/construction.mjs";
import { omit } from "../../../../helpers/utils.mjs";
import { ResistActivation } from "../../activations/command-activations.mjs";
import { CritMechanicMixin } from "../../mixins/_module.mjs";
import { ThresholdAutomation } from "../abstract/_module.mjs";
import * as automationMixins from "../mixins/_module.mjs";

const { fields } = foundry.data;

/**
 * @mixes CritMechanic
 * @mixes TriggerAutomation
 */
export default class ResistAutomation
  extends mixClasses(ThresholdAutomation, CritMechanicMixin, automationMixins.TriggerAutomationMixin)
{
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AUTOMATIONS.Resist"];

  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.TERMS.EffectTypes.resistance";
  }

  /** @inheritDoc */
  static get metadata() {
    return Object.assign(super.metadata, { type: "resist" });
  }

  /** @inheritDoc */
  static defineSchema() {
    return omit(
      Object.assign(super.defineSchema(), { hex: new fields.BooleanField({ label: "TERIOCK.COMMON.Hexproof" }) }),
      ["threshold"],
    );
  }

  /** @inheritDoc */
  get _formPaths() {
    return ["hex", "bonus", ...this._triggerPaths];
  }

  /** @inheritDoc */
  async _getActivations() {
    return [new ResistActivation({ options: { bonus: this.bonus, type: this.hex ? "hexproof" : "resistance" } })];
  }
}
