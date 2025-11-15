import ActionHandler from "../action-handler.mjs";

/**
 * Action to take a hack.
 */
export class TakeHackHandler extends ActionHandler {
  /** @inheritDoc */
  static ACTION = "take-hack";

  /**
   * @inheritDoc
   * @param {Teriock.Parameters.Actor.HackableBodyPart} part
   */
  static buildButton(part) {
    const button = super.buildButton();
    button.icon = TERIOCK.display.buttons.hackButtons[part].icon;
    button.label = TERIOCK.display.buttons.hackButtons[part].label;
    button.dataset.part = part;
    return button;
  }

  /** @inheritDoc */
  async primaryAction() {
    for (const actor of this.actors) {
      await actor.system.takeHack(this.dataset.part);
    }
  }

  /** @inheritDoc */
  async secondaryAction() {
    for (const actor of this.actors) {
      await actor.system.takeUnhack(this.dataset.part);
    }
  }
}

/**
 * Action to heal a hack.
 */
export class TakeUnhackHandler extends ActionHandler {
  /** @inheritDoc */
  static ACTION = "take-unhack";

  /**
   * @inheritDoc
   * @param {Teriock.Parameters.Actor.HackableBodyPart} part
   */
  static buildButton(part) {
    const button = super.buildButton();
    button.icon = TERIOCK.display.buttons.hackButtons[part].icon;
    button.label = TERIOCK.display.buttons.hackButtons[part].label.replace(
      "Hack",
      "Unhack",
    );
    button.dataset.part = part;
    return button;
  }

  /** @inheritDoc */
  async primaryAction() {
    for (const actor of this.actors) {
      await actor.system.takeUnhack(this.dataset.part);
    }
  }

  /** @inheritDoc */
  async secondaryAction() {
    for (const actor of this.actors) {
      await actor.system.takeHack(this.dataset.part);
    }
  }
}
