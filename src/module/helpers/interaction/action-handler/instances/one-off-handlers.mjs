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
      await actor.system.takeAwaken();
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
      await actor.system.takeRevive();
    }
  }
}

/**
 * Action to trigger healing.
 */
export class HealHandler extends ActionHandler {
  /** @inheritDoc */
  static ACTION = "heal";

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
export class RevitalizeHandler extends ActionHandler {
  /** @inheritDoc */
  static ACTION = "revitalize";

  /** @inheritDoc */
  async primaryAction() {
    for (const actor of this.actors) {
      await actor.system.takeNormalRevitalize();
    }
  }
}
