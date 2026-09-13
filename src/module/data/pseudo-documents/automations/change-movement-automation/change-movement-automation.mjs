import { mergeMetadata, mixClasses } from "../../../../helpers/construction.mjs";
import { movementActionField } from "../../../fields/tools/builders.mjs";
import { ChangeMovementActivation } from "../../activations/_module.mjs";
import { BaseAutomation } from "../abstract/_module.mjs";
import { TriggerAutomationMixin } from "../mixins/_module.mjs";

/**
 * @mixes TriggerAutomation
 */
export default class ChangeMovementAutomation extends mixClasses(BaseAutomation, TriggerAutomationMixin) {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AUTOMATIONS.ChangeMovement"];

  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, { type: "changeMovement" });

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
