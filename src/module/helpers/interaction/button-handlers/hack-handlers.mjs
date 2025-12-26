import AbstractButtonHandler from "./abstract-button-handler.mjs";

/**
 * Action to take a hack.
 */
export class TakeHackHandler extends AbstractButtonHandler {
  /** @inheritDoc */
  static ACTION = "take-hack";

  /**
   * @inheritDoc
   * @param {Teriock.Parameters.Actor.HackableBodyPart} part
   */
  static buildButton(part) {
    const button = super.buildButton();
    button.icon = TERIOCK.options.hack[part].icon;
    button.label = TERIOCK.options.hack[part].label;
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
export class TakeUnhackHandler extends AbstractButtonHandler {
  /** @inheritDoc */
  static ACTION = "take-unhack";

  /**
   * @inheritDoc
   * @param {Teriock.Parameters.Actor.HackableBodyPart} part
   */
  static buildButton(part) {
    const button = super.buildButton();
    button.icon = TERIOCK.options.hack[part].icon;
    button.label = TERIOCK.options.hack[part].label.replace("Hack", "Unhack");
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
