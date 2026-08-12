import { mixClasses } from "../../../../helpers/construction.mjs";
import { movementActionField } from "../../../fields/tools/builders.mjs";
import { ChangeMovementActivation } from "../../activations/_module.mjs";
import { CritMechanicMixin } from "../../mixins/_module.mjs";
import { BaseAutomation } from "../abstract/_module.mjs";
import * as automationMixins from "../mixins/_module.mjs";

/**
 * @mixes CritMechanic
 * @mixes TriggerAutomation
 */
export default class ChangeMovementAutomation
  extends mixClasses(BaseAutomation, CritMechanicMixin, automationMixins.TriggerAutomationMixin)
{
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
    return ["movementAction", ...super._formPaths];
  }

  /** @inheritDoc */
  async _getActivations() {
    return [new ChangeMovementActivation({ movementAction: this.movementAction })];
  }
}
