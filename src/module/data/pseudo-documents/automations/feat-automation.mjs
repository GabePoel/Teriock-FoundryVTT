import { FeatActivation } from "../activations/command-activations.mjs";
import { ThresholdAutomation } from "./abstract/_module.mjs";

const { fields } = foundry.data;

export default class FeatAutomation extends ThresholdAutomation {
  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.ROLLS.Feat.label";
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
        label: "TERIOCK.TERMS.Common.attribute",
      }),
    });
  }

  /** @inheritDoc */
  get _formPaths() {
    return ["attribute", ...super._formPaths];
  }

  /** @inheritDoc */
  async getActivations() {
    return [
      new FeatActivation({
        options: {
          attribute: this.attribute,
          bonus: this.bonus,
          threshold: this.threshold,
        },
      }),
    ];
  }
}
