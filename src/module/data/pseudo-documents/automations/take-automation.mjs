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
  static get LABEL() {
    return "Take";
  }

  /** @inheritDoc */
  static get TYPE() {
    return "take";
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      take: new fields.StringField({
        label: "Type",
        choices: TERIOCK.options.consequence.rolls,
      }),
      amount: new fields.NumberField({
        label: "Amount",
        hint: "A numerical amount of the effect to take. Leave blank to have it be the result of the roll.",
        nullable: true,
      }),
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
