import { makeIconClass } from "../../../utils.mjs";
import ActionHandler from "../action-handler.mjs";

/**
 * Action to trigger a tradecraft check roll.
 */
export class TradecraftCheckHandler extends ActionHandler {
  /** @inheritDoc */
  static ACTION = "tradecraft-check";

  /**
   * @inheritDoc
   * @param {Teriock.Parameters.Fluency.Tradecraft} tradecraft
   * @param {number} [threshold]
   */
  static buildButton(tradecraft, threshold) {
    const button = super.buildButton();
    button.icon = makeIconClass(
      TERIOCK.options.document.fluency.icon,
      "button",
    );
    button.label = `${TERIOCK.index.tradecrafts[tradecraft]} Check`;
    button.dataset.tradecraft = `${tradecraft}`;
    if (threshold) {
      button.dataset.dc = `${threshold}`;
    }
    return button;
  }

  /** @inheritDoc */
  async primaryAction() {
    if (typeof this.dataset.dc === "number") {
      this.commonRollOptions.threshold = Number(this.dataset.dc);
    }
    for (const actor of this.actors) {
      await actor.system.rollTradecraft(
        this.dataset.tradecraft,
        this.commonRollOptions,
      );
    }
  }
}
