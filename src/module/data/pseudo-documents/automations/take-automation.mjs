import { TakeActivation } from "../activations/_module.mjs";
import { BaseAutomation } from "./abstract/_module.mjs";
import { LabelAutomationMixin } from "./mixins/_module.mjs";

const { fields } = foundry.data;

/**
 * @property {Teriock.Keys.RollImpact} take
 * @property {number | null} amount
 * @mixes LabelAutomation
 * @extends {BaseAutomation}
 */
export default class TakeAutomation extends LabelAutomationMixin(
  BaseAutomation,
) {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "TERIOCK.AUTOMATIONS.TakeAutomation",
  ];

  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.AUTOMATIONS.TakeAutomation.LABEL";
  }

  /** @inheritDoc */
  static get TYPE() {
    return "take";
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      take: new fields.StringField({
        choices: TERIOCK.options.consequence.takes,
      }),
      amount: new fields.NumberField({ nullable: true }),
    });
  }

  /** @inheritDoc */
  get _formPaths() {
    return ["take", "amount", "title"];
  }

  /** @inheritDoc */
  async getActivations() {
    return [
      new TakeActivation({
        take: this.take,
        amount: this.amount,
        display: { label: this.title },
      }),
    ];
  }
}
