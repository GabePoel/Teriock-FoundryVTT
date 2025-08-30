import ActionHandler from "../action-handler.mjs";

/**
 * Action to trigger a feat save roll.
 */
export class FeatSaveHandler extends ActionHandler {
  /** @inheritDoc */
  static ACTION = "feat-save";

  /** @inheritDoc */
  async primaryAction() {
    if (!isNaN(Number(this.dataset.dc))) {
      this.commonRollOptions.threshold = Number(this.dataset.dc);
    }
    for (const actor of this.actors) {
      await actor.rollFeatSave(this.dataset.attribute, this.commonRollOptions);
    }
  }
}
