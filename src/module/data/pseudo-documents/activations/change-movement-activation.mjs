import ChangeMovementAutomation from "../automations/change-movement-automation.mjs";
import { AutomationActivationFactory } from "./abstract/_module.mjs";

/**
 * @property {string} movementAction
 */
export default class ChangeMovementActivation extends AutomationActivationFactory(ChangeMovementAutomation) {
  /** @inheritDoc */
  static get ICON() {
    return "ms-sprint";
  }

  /**
   * @param {string} movementAction
   * @return {string}
   */
  static getLabel(movementAction) {
    return _loc(CONFIG.Token.movement.actions[movementAction].label);
  }

  /** @inheritDoc */
  get icon() {
    return this.symbol || CONFIG.Token.movement.actions[this.movementAction]?.icon || this.constructor.ICON;
  }

  /** @inheritDoc */
  get label() {
    return this.display.label || ChangeMovementActivation.getLabel(this.movementAction) || this.constructor.LABEL;
  }

  /** @inheritDoc */
  async primaryAction() {
    if (!this.checkTokens()) {
      return;
    }
    for (const t of this.tokenDocuments) {
      if (t.movementAction !== this.movementAction) {
        const old = t.movementAction;
        await t.update({
          "flags.teriock.previousMovementAction": t.movementAction,
          movementAction: this.movementAction,
        });
        ui.notifications.success("TERIOCK.COMMANDS.ChangeMovement.changed", {
          format: {
            new: ChangeMovementActivation.getLabel(this.movementAction),
            old: ChangeMovementActivation.getLabel(old),
            token: t.name,
          },
          localize: true,
        });
      } else {
        ui.notifications.warn("TERIOCK.COMMANDS.ChangeMovement.already", {
          format: {
            movement: ChangeMovementActivation.getLabel(this.movementAction),
            token: t.name,
          },
          localize: true,
        });
      }
    }
  }

  /** @inheritDoc */
  async secondaryAction() {
    if (!this.checkTokens()) {
      return;
    }
    for (const t of this.tokenDocuments) {
      if (
        t.movementAction === this.movementAction &&
        t.getFlag("teriock", "previousMovementAction") &&
        t.movementAction !== t.getFlag("teriock", "previousMovementAction")
      ) {
        await t.update({
          "flags.teriock.previousMovementAction": this.movementAction,
          movementAction: t.getFlag("teriock", "previousMovementAction"),
        });
        ui.notifications.success("TERIOCK.COMMANDS.ChangeMovement.reverted", {
          format: {
            new: ChangeMovementActivation.getLabel(t.movementAction),
            old: ChangeMovementActivation.getLabel(this.movementAction),
            token: t.name,
          },
          localize: true,
        });
      } else {
        ui.notifications.warn("TERIOCK.COMMANDS.ChangeMovement.notFount", {
          format: {
            movement: ChangeMovementActivation.getLabel(this.movementAction),
            token: t.name,
          },
          localize: true,
        });
      }
    }
  }
}
