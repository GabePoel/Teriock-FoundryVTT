import { makeIconClass } from "../../../utils.mjs";
import ActionHandler from "../action-handler.mjs";

/**
 * Action to trigger a resistance roll.
 */
export class ResistHandler extends ActionHandler {
  /** @inheritDoc */
  static ACTION = "resist";

  /**
   * @inheritDoc
   * @param {boolean} [hex]
   */
  static buildButton(hex) {
    const button = super.buildButton();
    button.icon = makeIconClass("shield-alt", "button");
    button.label = `Roll ${hex ? "Hexproof" : "Resistance"}`;
    if (hex) {
      button.dataset.hex = "true";
    }
    return button;
  }

  /** @inheritDoc */
  async primaryAction() {
    for (const actor of this.actors) {
      const options = this.commonRollOptions;
      if (this.dataset.hex) {
        options.hex = true;
      }
      await actor.system.rollResistance(options);
    }
  }
}
