import { BaseRoll } from "../../../dice/rolls/_module.mjs";
import { mix } from "../../../helpers/construction.mjs";
import { FormulaField } from "../../fields/_module.mjs";
import { movementActionField } from "../../fields/helpers/builders.mjs";
import { MoveActivation } from "../activations/_module.mjs";
import { BaseAutomation } from "./abstract/_module.mjs";
import { DisplayAutomationMixin } from "./mixins/_module.mjs";

const { fields } = foundry.data;

/**
 * @property {Teriock.System.FormulaString} distance
 * @property {string} movementAction
 * @property {boolean} randomDirection
 * @mixes DisplayAutomation
 */
export default class MoveAutomation extends mix(
  BaseAutomation,
  DisplayAutomationMixin,
) {
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "TERIOCK.AUTOMATIONS.Move",
  ];

  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.AUTOMATIONS.Move.LABEL";
  }

  /** @inheritDoc */
  static get TYPE() {
    return "move";
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      distance: new FormulaField({ deterministic: false, initial: "0" }),
      movementAction: movementActionField({
        blank: true,
        initial: null,
        nullable: true,
        required: false,
      }),
      randomDirection: new fields.BooleanField(),
    });
  }

  /** @inheritDoc */
  get _formPaths() {
    return [
      "distance",
      "movementAction",
      ...this._displayPaths,
      "randomDirection",
    ];
  }

  /** @inheritDoc */
  async getActivations(options = {}) {
    if (!options.execution?.executor?.document?.uuid && !this.randomDirection) {
      return [];
    }
    const distance = await BaseRoll.getValue(
      this.distance,
      options.rollData ?? {},
    );
    return [
      new MoveActivation({
        display: this.display,
        distance,
        movementAction: this.movementAction || null,
        randomDirection: this.randomDirection,
        token: options.execution?.executor?.document?.uuid,
      }),
    ];
  }
}
