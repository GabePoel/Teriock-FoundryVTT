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

  /**
   * The amount this should apply.
   * @returns {number|null}
   */
  get #amount() {
    return (
      this.amount ??
      this.document?.rolls?.find((r) => r.hasImpact)?.total ??
      null
    );
  }

  /**
   * The config entry for this activation's impact.
   * @returns {Teriock.Config.ImpactEntry}
   */
  get #entry() {
    return TERIOCK.config.impact[this.impact];
  }

  /**
   * Whether to show a dialog.
   * @returns {boolean}
   */
  get #showDialog() {
    if (typeof this.#amount !== "number") return true;
    let showDialog =
      this.showDialog || game.teriock.getSetting("showImpactDialogs");
    if (this.event.ctrlKey) showDialog = !showDialog;
    return showDialog;
  }

  /** @inheritDoc */
  get classes() {
    return [super.classes, this.impact + "-button"].join(" ");
  }

  /** @inheritDoc */
  get icon() {
    return this.display.icon || this.#entry?.icon || this.constructor.ICON;
  }

  /** @inheritDoc */
  get label() {
    return this.display.label || this.#entry?.take || this.constructor.LABEL;
  }

  /** @inheritDoc */
  async primaryAction() {
    for (const actor of this.actors) {
      if (this.#showDialog) {
        await actor.system.impactDialog(this.impact, {
          amount: this.#amount,
          morganti: this.morganti,
        });
      } else {
        await this.#entry.apply(actor, this.#amount);
        ui.notifications.success(
          "TERIOCK.ACTIVATIONS.Take.NOTIFICATIONS.applied",
          {
            format: {
              amount: this.#amount,
              impact: this.label,
              actor: actor.fullName,
            },
            localize: true,
          },
        );
      }
    }
  }

  /** @inheritDoc */
  async secondaryAction() {
    for (const actor of this.actors) {
      await this.#entry?.reverse(actor, this.#amount);
      ui.notifications.success(
        "TERIOCK.ACTIVATIONS.Take.NOTIFICATIONS.reversed",
        {
          format: {
            amount: this.#amount,
            impact: this.label,
            actor: actor.fullName,
          },
          localize: true,
        },
      );
    }
  }
}
