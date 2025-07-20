import ActionHandler from "../action-handler.mjs";

/**
 * Action to take a hack.
 */
export class TakeHackHandler extends ActionHandler {
  /** @inheritDoc */
  static ACTION = "take-hack";

  /** @inheritDoc */
  async primaryAction() {
    for (const actor of this.actors) {
      await actor.takeHack(this.dataset.part);
    }
  }

  /** @inheritDoc */
  async secondaryAction() {
    for (const actor of this.actors) {
      await actor.takeUnhack(this.dataset.part);
    }
  }
}

/**
 * Action to heal a hack.
 */
export class TakeUnhackHandler extends ActionHandler {
  /** @inheritDoc */
  static ACTION = "take-unhack";

  /** @inheritDoc */
  async primaryAction() {
    for (const actor of this.actors) {
      await actor.takeUnhack(this.dataset.part);
    }
  }

  /** @inheritDoc */
  async secondaryAction() {
    for (const actor of this.actors) {
      await actor.takeHack(this.dataset.part);
    }
  }
}
