import ActionHandler from "../action-handler.mjs";

/**
 * Action to trigger a resistance roll.
 */
export class ResistHandler extends ActionHandler {
  /** @inheritDoc */
  static ACTION = "resist";

  /** @inheritDoc */
  async primaryAction() {
    for (const actor of this.actors) {
      await actor.rollResistance(this.commonRollOptions);
    }
  }
}
