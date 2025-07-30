import ActionHandler from "../action-handler.mjs";

/**
 * Action to trigger a tradecraft check roll.
 */
export class TradecraftCheckHandler extends ActionHandler {
  /** @inheritDoc */
  static ACTION = "tradecraft-check";

  /** @inheritDoc */
  async primaryAction() {
    if (typeof this.dataset.dc === "number") {
      this.commonRollOptions.threshold = Number(this.dataset.dc);
    }
    for (const actor of this.actors) {
      await actor.rollTradecraft(
        this.dataset.tradecraft,
        this.commonRollOptions,
      );
    }
  }
}
