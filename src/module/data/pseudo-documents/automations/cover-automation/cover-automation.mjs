import { mergeMetadata, mixClasses } from "../../../../helpers/construction.mjs";
import { TakeCoverActivation, TakeUncoverActivation } from "../../activations/command-activations.mjs";
import { BaseAutomation } from "../abstract/_module.mjs";
import { TriggerAutomationMixin } from "../mixins/_module.mjs";

const { fields } = foundry.data;

/**
 * @mixes TriggerAutomation
 */
export default class CoverAutomation extends mixClasses(BaseAutomation, TriggerAutomationMixin) {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AUTOMATIONS.Cover"];

  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, { type: "cover" });

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), { reverse: new fields.BooleanField() });
  }

  /** @inheritDoc */
  get _formPaths() {
    return ["reverse", ...super._formPaths];
  }

  /** @inheritDoc */
  async _getActivations() {
    if (this.reverse) { return [new TakeUncoverActivation()]; }
    return [new TakeCoverActivation()];
  }
}
