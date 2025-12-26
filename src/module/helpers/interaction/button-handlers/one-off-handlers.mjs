import { makeIconClass } from "../../utils.mjs";
import AbstractButtonHandler from "./abstract-button-handler.mjs";

/**
 * Action to trigger awaken.
 */
export class AwakenHandler extends AbstractButtonHandler {
  /** @inheritDoc */
  static ACTION = "awaken";

  /**
   * @inheritDoc
   */
  static buildButton() {
    const button = super.buildButton();
    button.icon = makeIconClass("sunrise", "button");
    button.label = "Awaken";
    return button;
  }

  /** @inheritDoc */
  async primaryAction() {
    for (const actor of this.actors) {
      await actor.system.takeAwaken();
    }
  }
}

/**
 * Action to trigger revival.
 */
export class ReviveHandler extends AbstractButtonHandler {
  static ACTION = "revive";

  /**
   * @inheritDoc
   */
  static buildButton() {
    const button = super.buildButton();
    button.icon = makeIconClass("heart-plus", "button");
    button.label = "Revive";
    return button;
  }

  /** @inheritDoc */
  async primaryAction() {
    for (const actor of this.actors) {
      await actor.system.takeRevive();
    }
  }
}

/**
 * Action to trigger healing.
 */
export class HealHandler extends AbstractButtonHandler {
  /** @inheritDoc */
  static ACTION = "heal";

  /**
   * @inheritDoc
   */
  static buildButton() {
    const button = super.buildButton();
    button.icon = makeIconClass("hand-holding-heart", "button");
    button.label = "Heal";
    return button;
  }

  /** @inheritDoc */
  async primaryAction() {
    for (const actor of this.actors) {
      await actor.system.takeNormalHeal();
    }
  }
}

/**
 * Action to trigger revitalizing.
 */
export class RevitalizeHandler extends AbstractButtonHandler {
  /** @inheritDoc */
  static ACTION = "revitalize";

  /**
   * @inheritDoc
   */
  static buildButton() {
    const button = super.buildButton();
    button.icon = makeIconClass("hand-holding-droplet", "button");
    button.label = "Revitalize";
    return button;
  }

  /** @inheritDoc */
  async primaryAction() {
    for (const actor of this.actors) {
      await actor.system.takeNormalRevitalize();
    }
  }
}

export class DeathBagHandler extends AbstractButtonHandler {
  /** @inheritDoc */
  static ACTION = "death-bag";

  /**
   * @inheritDoc
   */
  static buildButton() {
    const button = super.buildButton();
    button.icon = makeIconClass("sack", "button");
    button.label = "Death Bag";
    return button;
  }

  /** @inheritDoc */
  async primaryAction() {
    for (const actor of this.actors) {
      await actor.system.deathBagPull();
    }
  }
}
