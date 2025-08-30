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
      await actor.toggleStatusEffect(this.dataset.status, { active: true });
    }
  }

  /** @inheritDoc */
  async secondaryAction() {
    await removeStatus(this.actors, this.dataset.status);
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
    await removeStatus(this.actors, this.dataset.status);
  }

  /** @inheritDoc */
  async secondaryAction() {
    for (const actor of this.actors) {
      await actor.toggleStatusEffect(this.dataset.status, { active: true });
    }
  }
}

/**
 * Remove the condition and all consequences that provide it.
 * @param {TeriockActor[]} actors
 * @param {Teriock.Parameters.Condition.Key} status
 * @returns {Promise<void>}
 */
async function removeStatus(actors, status) {
  for (const actor of actors) {
    await actor.toggleStatusEffect(status, { active: false });
    const toRemove = actor.consequences
      .filter((c) => c.statuses.has(status))
      .map((c) => c.id);
    await actor.deleteEmbeddedDocuments("ActiveEffect", toRemove);
  }
}
