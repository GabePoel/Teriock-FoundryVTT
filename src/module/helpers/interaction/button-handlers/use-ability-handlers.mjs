import { makeIconClass } from "../../utils.mjs";
import AbstractButtonHandler from "./abstract-button-handler.mjs";

/**
 * Action to use an ability.
 */
export class UseAbilityHandler extends AbstractButtonHandler {
  /** @inheritDoc */
  static ACTION = "use-ability";

  /**
   * @inheritDoc
   * @param {string} abilityName
   */
  static buildButton(abilityName) {
    const button = super.buildButton();
    button.icon = makeIconClass(
      TERIOCK.options.document.ability.icon,
      "button",
    );
    button.label = `Use ${abilityName}`;
    button.dataset.ability = abilityName;
    return button;
  }

  /** @inheritDoc */
  async primaryAction() {
    for (const actor of this.actors) {
      await actor.useAbility(this.dataset.ability, this.commonRollOptions);
    }
  }
}
