import { mergeMetadata, mixClasses } from "../../../../utils/_module.mjs";
import { commandActivations } from "../../activations/command-activations.mjs";
import { ThresholdAutomation } from "../abstract/_module.mjs";
import { TriggerAutomationMixin } from "../mixins/_module.mjs";

const { fields } = foundry.data;

/**
 * @extends {ThresholdAutomation}
 * @mixes TriggerAutomation
 */
export default class FeatAutomation extends mixClasses(ThresholdAutomation, TriggerAutomationMixin) {
  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, { type: "feat" });

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      attribute: new fields.StringField({
        choices: TERIOCK.CONFIG.attribute,
        initial: "int",
        label: "TERIOCK.COMMON.Attribute",
        required: true,
      }),
    });
  }

  /** @inheritDoc */
  get _formPaths() {
    return ["attribute", ...super._formPaths];
  }

  /** @inheritDoc */
  async _getActivations(options) {
    const threshold = await this.getThreshold(options?.rollData ?? {});
    return [
      new commandActivations.feat({
        display: this.getDisplayData(threshold),
        options: { attribute: this.attribute, bonus: this.bonus, threshold },
      }),
    ];
  }
}
