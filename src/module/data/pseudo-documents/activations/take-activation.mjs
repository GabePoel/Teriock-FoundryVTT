import { icons } from "../../../constants/display/icons.mjs";
import { BaseActivation } from "./abstract/_module.mjs";

const { fields } = foundry.data;

/**
 * @property {Teriock.Keys.RollImpact} take
 * @property {number} amount
 */
export default class TakeActivation extends BaseActivation {
  /** @inheritDoc */
  static get ICON() {
    return icons.consequence.crit;
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
  get classes() {
    return [super.classes, this.take + "-button"].join(" ");
  }

  /** @inheritDoc */
  get icon() {
    return (
      this.display.icon ||
      TERIOCK.options.take[this.take]?.icon ||
      this.constructor.ICON
    );
  }

  /** @inheritDoc */
  get label() {
    return (
      this.display.label ||
      TERIOCK.options.take[this.take]?.take ||
      this.constructor.LABEL
    );
  }

  /** @inheritDoc */
  async primaryAction() {
    for (const actor of this.actors) {
      TERIOCK.options.take[this.take].apply(actor, this.amount);
    }
  }

  /** @inheritDoc */
  async secondaryAction() {
    for (const actor of this.actors) {
      TERIOCK.options.take[this.take].reverse(actor, this.amount);
    }
  }
}
