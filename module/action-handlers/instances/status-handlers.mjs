import ActionHandler from "../action-handler.mjs";

/**
 * Action to apply a condition.
 */
export class ApplyStatusHandler extends ActionHandler {
  /** @inheritDoc */
  static ACTION = "apply-status";

  /** @inheritDoc */
  async primaryAction() {
    for (const actor of this.actors) {
      await actor.toggleStatusEffect(this.dataset.status, true)
    }
  }

  /** @inheritDoc */
  async secondaryAction() {
    for (const actor of this.actors) {
      await actor.toggleStatusEffect(this.dataset.status, false)
    }
  }
}

/**
 * Action to remove a condition.
 */
export class RemoveStatusHandler extends ActionHandler {
  /** @inheritDoc */
  static ACTION = "remove-status";

  /** @inheritDoc */
  async primaryAction() {
    for (const actor of this.actors) {
      await actor.toggleStatusEffect(this.dataset.status, false)
    }
  }

  /** @inheritDoc */
  async secondaryAction() {
    for (const actor of this.actors) {
      await actor.toggleStatusEffect(this.dataset.status, true)
    }
  }
}