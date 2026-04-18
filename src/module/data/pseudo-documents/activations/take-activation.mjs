import { icons } from "../../../constants/display/icons.mjs";
import TakeAutomation from "../automations/take-automation.mjs";
import { AutomationActivationFactory } from "./abstract/_module.mjs";

/**
 * @property {Teriock.Keys.Impact} impact
 * @property {number} amount
 */
export default class TakeActivation extends AutomationActivationFactory(
  TakeAutomation,
) {
  /** @inheritDoc */
  static get ICON() {
    return icons.consequence.crit;
  }

  /** @inheritDoc */
  get classes() {
    return [super.classes, this.impact + "-button"].join(" ");
  }

  /** @inheritDoc */
  get icon() {
    return (
      this.display.icon ||
      TERIOCK.config.impact[this.impact]?.icon ||
      this.constructor.ICON
    );
  }

  /** @inheritDoc */
  get label() {
    return (
      this.display.label ||
      TERIOCK.config.impact[this.impact]?.take ||
      this.constructor.LABEL
    );
  }

  /** @inheritDoc */
  async primaryAction() {
    for (const actor of this.actors) {
      await TERIOCK.config.impact[this.impact].apply(actor, this.amount);
      ui.notifications.success(
        "TERIOCK.ACTIVATIONS.Take.NOTIFICATIONS.applied",
        {
          format: {
            amount: this.amount,
            impact: this.label,
            actor: actor.fullName,
          },
          localize: true,
        },
      );
    }
  }

  /** @inheritDoc */
  async secondaryAction() {
    for (const actor of this.actors) {
      await TERIOCK.config.impact[this.impact].reverse(actor, this.amount);
      ui.notifications.success(
        "TERIOCK.ACTIVATIONS.Take.NOTIFICATIONS.reversed",
        {
          format: {
            amount: this.amount,
            impact: this.label,
            actor: actor.fullName,
          },
          localize: true,
        },
      );
    }
  }
}
