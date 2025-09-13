import { healDialog } from "../../../../applications/dialogs/_module.mjs";
import revitalizeDialog from "../../../../applications/dialogs/revitalize-dialog.mjs";
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

/**
 * Action to trigger healing.
 */
export class HealHandler extends ActionHandler {
  /** @inheritDoc */
  static ACTION = "heal";

  /** @inheritDoc */
  async primaryAction() {
    for (const actor of this.actors) {
      await healDialog(actor);
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
      await revitalizeDialog(actor);
    }
  }
}
