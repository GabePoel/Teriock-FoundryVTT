import { makeIconClass } from "../../utils.mjs";
import AbstractButtonHandler from "./abstract-button-handler.mjs";

/**
 * Action to apply a condition.
 */
export class ApplyStatusHandler extends AbstractButtonHandler {
  /** @inheritDoc */
  static ACTION = "apply-status";

  /**
   * @inheritDoc
   * @param {Teriock.Parameters.Condition.ConditionKey} status
   */
  static buildButton(status) {
    const button = super.buildButton();
    button.icon = makeIconClass("plus", "button");
    button.label = `Apply ${TERIOCK.index.conditions[status]}`;
    button.dataset.status = status;
    return button;
  }

  /** @inheritDoc */
  async primaryAction() {
    for (const actor of this.actors) {
      await actor.toggleStatusEffect(this.dataset.status, { active: true });
    }
  }

  /** @inheritDoc */
  async secondaryAction() {
    for (const actor of this.actors) {
      await actor.system.removeCondition(this.dataset.status);
    }
  }
}

/**
 * Action to remove a condition.
 */
export class RemoveStatusHandler extends AbstractButtonHandler {
  /** @inheritDoc */
  static ACTION = "remove-status";

  /**
   * @inheritDoc
   * @param {Teriock.Parameters.Condition.ConditionKey} status
   */
  static buildButton(status) {
    const button = super.buildButton();
    button.icon = makeIconClass("xmark", "button");
    button.label = `Remove ${TERIOCK.index.conditions[status]}`;
    button.dataset.status = status;
    return button;
  }

  /** @inheritDoc */
  async primaryAction() {
    for (const actor of this.actors) {
      await actor.system.removeCondition(this.dataset.status);
    }
  }

  /** @inheritDoc */
  async secondaryAction() {
    for (const actor of this.actors) {
      await actor.toggleStatusEffect(this.dataset.status, { active: true });
    }
  }
}
