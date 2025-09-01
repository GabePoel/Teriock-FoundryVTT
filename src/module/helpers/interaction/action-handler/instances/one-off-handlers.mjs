import ActionHandler from "../action-handler.mjs";

/**
 * Action to trigger awaken.
 */
export class AwakenHandler extends ActionHandler {
  /** @inheritDoc */
  static ACTION = "awaken";

  /** @inheritDoc */
  async primaryAction() {
    for (const actor of this.actors) {
      await actor.takeAwaken();
    }
  }
}

/**
 * Action to trigger revival.
 */
export class ReviveHandler extends ActionHandler {
  static ACTION = "revive";

  /** @inheritDoc */
  async primaryAction() {
    for (const actor of this.actors) {
      await actor.takeRevive();
    }
  }
}
