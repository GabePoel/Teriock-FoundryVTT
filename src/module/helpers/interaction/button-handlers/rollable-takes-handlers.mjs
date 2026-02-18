import { getRollIcon, makeIconClass } from "../../utils.mjs";
import commands from "../commands/_module.mjs";
import AbstractButtonHandler from "./abstract-button-handler.mjs";

/**
 * Action to roll a rollable take.
 */
export class RollRollableTakeHandler extends AbstractButtonHandler {
  /** @inheritDoc */
  static ACTION = "roll-rollable-take";

  /**
   * @inheritDoc
   * @param {string} rollType
   * @param {string} formula
   * @param {object} [options]
   * @param {boolean} [options.merge]
   * @param {string} [options.label]
   * @returns {Teriock.UI.HTMLButtonConfig}
   */
  static buildButton(rollType, formula, options = { merge: true }) {
    const button = super.buildButton();
    button.icon = makeIconClass(getRollIcon(formula), "button");
    button.label =
      options.label || `Roll ${TERIOCK.options.take[rollType].label}`;
    button.dataset.type = rollType;
    button.dataset.formula = formula;
    button.dataset.tooltip = formula;
    if (options.merge) button.dataset.merge = "true";
    return button;
  }

  /** @inheritDoc */
  async primaryAction() {
    for (const actor of this.actors) {
      await commands[this.dataset.type].primary(actor, this.dataset);
    }
  }

  /** @inheritDoc */
  async secondaryAction() {
    for (const actor of this.actors) {
      await commands[this.dataset.type].secondary(actor, this.dataset);
    }
  }
}

/**
 * Action to take a rollable take.
 */
export class TakeRollableTakeHandler extends AbstractButtonHandler {
  /** @inheritDoc */
  static ACTION = "take-rollable-take";

  /**
   * @inheritDoc
   * @param {Teriock.Interaction.TakeKey} rollType
   * @param {number} amount
   * @param {object} [options]
   * @param {string} [options.label]
   */
  static buildButton(rollType, amount, options = {}) {
    const button = super.buildButton();
    button.icon = makeIconClass(TERIOCK.options.take[rollType].icon, "button");
    button.label =
      options.label ||
      `${TERIOCK.options.take[rollType].prefix} ${TERIOCK.options.take[rollType].label}`;
    button.classes = ["teriock-chat-button", `${rollType}-button`];
    button.dataset.type = rollType;
    button.dataset.amount = amount.toString();
    return button;
  }

  /** @inheritDoc */
  async primaryAction() {
    for (const actor of this.actors) {
      TERIOCK.options.take[this.dataset.type].apply(
        actor,
        Number(this.dataset.amount),
      );
    }
  }

  /** @inheritDoc */
  async secondaryAction() {
    for (const actor of this.actors) {
      TERIOCK.options.take[this.dataset.type].reverse(
        actor,
        Number(this.dataset.amount),
      );
    }
  }
}
