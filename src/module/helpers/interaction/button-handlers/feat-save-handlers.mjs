import { makeIconClass } from "../../utils.mjs";
import AbstractButtonHandler from "./abstract-button-handler.mjs";

/**
 * Action to trigger a feat save roll.
 */
export class FeatSaveHandler extends AbstractButtonHandler {
  /** @inheritDoc */
  static ACTION = "feat-save";

  /**
   * @inheritDoc
   * @param {Teriock.Parameters.Actor.Attribute} attribute
   * @param {number} [threshold]
   */
  static buildButton(attribute, threshold) {
    const button = super.buildButton();
    button.icon = makeIconClass("dice-d20", "button");
    button.label = `Roll ${attribute.toUpperCase()} Save`;
    button.dataset.attribute = attribute;
    button.dataset.dc = threshold.toString();
    return button;
  }

  /** @inheritDoc */
  async primaryAction() {
    if (!isNaN(Number(this.dataset.dc))) {
      this.commonRollOptions.threshold = Number(this.dataset.dc);
    }
    for (const actor of this.actors) {
      await actor.system.rollFeatSave(
        this.dataset.attribute,
        this.commonRollOptions,
      );
    }
  }
}
