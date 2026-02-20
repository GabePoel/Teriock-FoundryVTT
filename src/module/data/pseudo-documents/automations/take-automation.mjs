import { TakeRollableTakeHandler } from "../../../helpers/interaction/button-handlers/rollable-takes-handlers.mjs";
import BaseAutomation from "./base-automation.mjs";
import { LabelAutomationMixin } from "./mixins/_module.mjs";

const { fields } = foundry.data;

/**
 * @property {Teriock.Parameters.Consequence.RollConsequenceKey} take
 * @property {number | null} amount
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
        choices: TERIOCK.options.consequence.rolls,
      }),
      amount: new fields.NumberField({ nullable: true }),
    });
  }

  /** @inheritDoc */
  get _formPaths() {
    return ["take", "amount", "title"];
  }

  /** @inheritDoc */
  get buttons() {
    return [
      TakeRollableTakeHandler.buildButton(this.take, 0, {
        label: this.title,
      }),
    ];
  }
}
