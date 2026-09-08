import { mixClasses } from "../../../helpers/construction.mjs";
import { omit } from "../../../helpers/utils.mjs";
import { SummonActivation } from "../activations/_module.mjs";
import { SelectionPseudoDocumentMixin } from "../mixins/_module.mjs";
import { BaseAutomation } from "./abstract/_module.mjs";
import { TriggerAutomationMixin } from "./mixins/_module.mjs";

/**
 * @mixes SelectionPseudoDocument
 * @mixes TriggerAutomation
 */
export default class SummonAutomation
  extends mixClasses(BaseAutomation, SelectionPseudoDocumentMixin, TriggerAutomationMixin)
{
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AUTOMATIONS.Summon"];

  /** @inheritdoc */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, { tags: { interactInExecution: true }, type: "summon" });
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

  /** @type {{ config: object, document: TeriockDocument|null }|null} */
  #selection = null;

  /** @inheritDoc */
  get _formPaths() {
    return [...this._selectionPaths, "hr", ...this._triggerDisplayPaths];
  }

  /** @inheritDoc */
  async _getActivations(options = {}) {
    const selection = this.#selection
      ?? await this._getSelection({ relativeTo: options.execution?.actor ?? options.actor ?? this.actor });
    if (!selection) { return []; }
    const display = {};
    if (selection.document) {
      display.label = _loc("TERIOCK.AUTOMATIONS.Summon.BUTTONS.placeNamed", {
        name: selection.document.name || _loc("TERIOCK.AUTOMATIONS.Summon.BUTTONS.defaultName"),
      });
    }
    return [new SummonActivation({ ...selection.config, display })];
  }

  /** @inheritDoc */
  _isSelectable(document) {
    return document?.documentName === "Actor";
  }

  /** @inheritDoc */
  async interactOnExecutionInput(execution) {
    this.#selection = this.interactInExecution ? await this._getSelection({ relativeTo: execution.actor }) : null;
  }
}
