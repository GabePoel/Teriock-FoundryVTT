import { FeatActivation } from "../activations/command-activations.mjs";
import { ThresholdAutomation } from "./abstract/_module.mjs";

const { fields } = foundry.data;

export default class FeatAutomation extends ThresholdAutomation {
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
        choices: TERIOCK.reference.attributesFull,
        initial: "int",
        label: "TERIOCK.TERMS.Common.attribute",
        required: true,
      }),
    });
  }

  /** @inheritDoc */
  get _formPaths() {
    return ["attribute", ...super._formPaths];
  }

  /** @inheritDoc */
  async getActivations(options) {
    const threshold = await this.getThreshold(options?.rollData ?? {});
    return [
      new FeatActivation({
        display: this.getDisplayData(threshold),
        options: { attribute: this.attribute, bonus: this.bonus, threshold },
      }),
    ];
  }
}
