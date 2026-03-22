import { makeIconClass } from "../../utils.mjs";
import BaseButtonHandler from "./base-button-handler.mjs";

export class ChangeMovementButtonHandler extends BaseButtonHandler {
  /** @inheritDoc */
  static ACTION = "change-movement";

  /**
   * @inheritDoc
   * @param {string} movementAction
   * @param {object} [options]
   * @param {string} [options.label]
   */
  static buildButton(movementAction, options = {}) {
    const button = super.buildButton();
    button.icon =
      CONFIG.Token.movement.actions[movementAction]?.icon ||
      makeIconClass("ms-sprint");
    button.label = options.label || this.getLabel(movementAction);
    button.dataset.movementAction = movementAction;
    return button;
  }

  /**
   * @param {string} movementAction
   * @return {string}
   */
  static getLabel(movementAction) {
    return game.i18n.localize(
      CONFIG.Token.movement.actions[movementAction].label,
    );
  }

  /**
   * @return {string}
   */
  get movementAction() {
    return this.dataset.movementAction || "walk";
  }

  /** @inheritDoc */
  async primaryAction() {
    for (const t of this.tokenDocuments) {
      if (t.movementAction !== this.movementAction) {
        const old = t.movementAction;
        await t.update({
          movementAction: this.movementAction,
          "flags.teriock.previousMovementAction": t.movementAction,
        });
        ui.notifications.success("TERIOCK.COMMANDS.ChangeMovement.changed", {
          format: {
            new: ChangeMovementButtonHandler.getLabel(this.movementAction),
            old: ChangeMovementButtonHandler.getLabel(old),
            token: t.name,
          },
          localize: true,
        });
      } else {
        ui.notifications.warn("TERIOCK.COMMANDS.ChangeMovement.already", {
          format: {
            movement: ChangeMovementButtonHandler.getLabel(this.movementAction),
            token: t.name,
          },
          localize: true,
        });
      }
    }
  }

  /** @inheritDoc */
  async secondaryAction() {
    for (const t of this.tokenDocuments) {
      if (
        t.movementAction === this.movementAction &&
        t.getFlag("teriock", "previousMovementAction") &&
        t.movementAction !== t.getFlag("teriock", "previousMovementAction")
      ) {
        await t.update({
          movementAction: t.getFlag("teriock", "previousMovementAction"),
          "flags.teriock.previousMovementAction": this.movementAction,
        });
        ui.notifications.success("TERIOCK.COMMANDS.ChangeMovement.reverted", {
          format: {
            new: ChangeMovementButtonHandler.getLabel(t.movementAction),
            old: ChangeMovementButtonHandler.getLabel(this.movementAction),
            token: t.name,
          },
          localize: true,
        });
      } else {
        ui.notifications.warn("TERIOCK.COMMANDS.ChangeMovement.notFount", {
          format: {
            movement: ChangeMovementButtonHandler.getLabel(this.movementAction),
            token: t.name,
          },
          localize: true,
        });
      }
    }
  }
}
