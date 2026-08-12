import { mixClasses } from "../../../../helpers/construction.mjs";
import { objectMap } from "../../../../helpers/utils.mjs";
import { FeatActivation } from "../../activations/command-activations.mjs";
import { CritMechanicMixin } from "../../mixins/_module.mjs";
import { ThresholdAutomation } from "../abstract/_module.mjs";
import * as automationMixins from "../mixins/_module.mjs";

const { fields } = foundry.data;

/**
 * @mixes CritMechanic
 * @mixes TriggerAutomation
 */
export default class FeatAutomation
  extends mixClasses(ThresholdAutomation, CritMechanicMixin, automationMixins.TriggerAutomationMixin)
{
  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.TERMS.Interaction.feat";
  }

  /** @inheritDoc */
  static get TYPE() {
    return "feat";
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      attribute: new fields.StringField({
        choices: objectMap(TERIOCK.config.attribute, (v) => v.label, { localize: true }),
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
      new FeatActivation({
        display: this.getDisplayData(threshold),
        options: { attribute: this.attribute, bonus: this.bonus, threshold },
      }),
    ];
  }
}
