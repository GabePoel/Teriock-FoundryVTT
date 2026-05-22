import { movementActionField } from "../../fields/helpers/builders.mjs";
import { ChangeMovementActivation } from "../activations/_module.mjs";
import { BaseAutomation } from "./abstract/_module.mjs";

export default class ChangeMovementAutomation extends BaseAutomation {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AUTOMATIONS.ChangeMovement"];

  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.AUTOMATIONS.ChangeMovement.LABEL";
  }

  /** @inheritDoc */
  static get TYPE() {
    return "changeMovement";
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), { movementAction: movementActionField() });
  }

  /** @inheritDoc */
  get _formPaths() {
    return ["movementAction"];
  }

  /** @inheritDoc */
  async getActivations() {
    return [new ChangeMovementActivation({ movementAction: this.movementAction })];
  }
}
