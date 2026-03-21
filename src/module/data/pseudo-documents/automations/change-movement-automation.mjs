import { ChangeMovementButtonHandler } from "../../../helpers/interaction/button-handlers/change-movement-button-handler.mjs";
import { localizeChoices } from "../../../helpers/localization.mjs";
import { objectMap } from "../../../helpers/utils.mjs";
import { BaseAutomation } from "./abstract/_module.mjs";

const { fields } = foundry.data;

export default class ChangeMovementAutomation extends BaseAutomation {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "TERIOCK.AUTOMATIONS.ChangeMovementAutomation",
  ];

  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.AUTOMATIONS.ChangeMovementAutomation.LABEL";
  }

  /** @inheritDoc */
  static get TYPE() {
    return "changeMovement";
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      movementAction: new fields.StringField({
        choices: localizeChoices(
          objectMap(
            Object.fromEntries(
              Object.entries(CONFIG.Token.movement.actions).filter(
                ([_k, v]) => {
                  if (typeof v.canSelect === "function") {
                    return v.canSelect();
                  } else if (typeof v.canSelect === "boolean") {
                    return v.canSelect;
                  } else {
                    return true;
                  }
                },
              ),
            ),
            (t) => t.label,
          ),
        ),
        initial: "walk",
        nullable: false,
      }),
    });
  }

  /** @inheritDoc */
  get _formPaths() {
    return ["movementAction"];
  }

  /** @inheritDoc */
  async getButtons() {
    return [ChangeMovementButtonHandler.buildButton(this.movementAction)];
  }
}
