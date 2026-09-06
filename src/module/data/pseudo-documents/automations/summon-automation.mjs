import { mixClasses } from "../../../helpers/construction.mjs";
import { omit } from "../../../helpers/utils.mjs";
import { SummonActivation } from "../activations/_module.mjs";
import { CritMechanicMixin, SelectionPseudoDocumentMixin } from "../mixins/_module.mjs";
import { BaseAutomation } from "./abstract/_module.mjs";
import { DisplayAutomationMixin, TriggerAutomationMixin } from "./mixins/_module.mjs";

/**
 * @mixes CritMechanic
 * @mixes SelectionPseudoDocument
 * @mixes DisplayAutomation
 * @mixes TriggerAutomation
 */
export default class SummonAutomation
  extends mixClasses(
    BaseAutomation,
    CritMechanicMixin,
    SelectionPseudoDocumentMixin,
    DisplayAutomationMixin,
    TriggerAutomationMixin,
  )
{
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AUTOMATIONS.Summon"];

  /** @inheritdoc */
  static get metadata() {
    return Object.assign(super.metadata, { type: "summon" });
  }

  /** @inheritDoc */
  static get triggerMetadata() {
    return Object.assign(super.triggerMetadata, { executionTriggers: ["execute"] });
  }

  /** @inheritDoc */
  static defineSchema() {
    return omit(super.defineSchema(), [
      "expandFolders",
      "expandTables",
      "localIdentifiers",
      "localQualifier",
      "localUuids",
    ]);
  }

  /** @inheritDoc */
  get _formPaths() {
    return [...this._selectionPaths, "hr", ...this._triggerDisplayPaths];
  }

  /** @inheritDoc */
  async _getActivations(options = {}) {
    const selections = await this._getSelections({
      relativeTo: options.execution?.actor ?? options.actor ?? this.actor,
    });
    return selections.map(({ config, document }) => {
      const display = foundry.utils.deepClone(this.display);
      if (document) {
        display.label ||= _loc("TERIOCK.AUTOMATIONS.Summon.BUTTONS.placeNamed", {
          name: document.name || _loc("TERIOCK.AUTOMATIONS.Summon.BUTTONS.defaultName"),
        });
      }
      return new SummonActivation({ ...config, display });
    });
  }

  /** @inheritDoc */
  _isSelectable(document) {
    return document?.documentName === "Actor";
  }
}
