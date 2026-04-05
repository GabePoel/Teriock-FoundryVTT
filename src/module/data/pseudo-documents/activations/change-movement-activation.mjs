import { movementActionField } from "../../fields/helpers/builders.mjs";
import { BaseActivation } from "./abstract/_module.mjs";

/**
 * @property {string} movementAction
 */
export default class ChangeMovementActivation extends BaseActivation {
  /** @inheritDoc */
  static get ICON() {
    return "ms-sprint";
  }

  /** @inheritDoc */
  static get TYPE() {
    return "changeMovement";
  }

  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      movementAction: movementActionField(),
    });
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

  /** @inheritDoc */
  get icon() {
    return (
      this.symbol ||
      CONFIG.Token.movement.actions[this.movementAction]?.icon ||
      this.constructor.ICON
    );
  }

  /** @inheritDoc */
  get label() {
    return (
      this.title ||
      ChangeMovementActivation.getLabel(this.movementAction) ||
      this.constructor.LABEL
    );
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
