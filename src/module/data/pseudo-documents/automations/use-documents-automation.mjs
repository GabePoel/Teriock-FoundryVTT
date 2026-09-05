import { mixClasses } from "../../../helpers/construction.mjs";
import { UseDocumentsActivation } from "../activations/_module.mjs";
import {
  CritMechanicMixin,
  OverrideCompetencePseudoDocumentMixin,
  OverrideDataPseudoDocumentMixin,
  SelectionPseudoDocumentMixin,
} from "../mixins/_module.mjs";
import { BaseAutomation } from "./abstract/_module.mjs";
import * as automationMixins from "./mixins/_module.mjs";

/**
 * @mixes CritMechanic
 * @mixes SelectionPseudoDocument
 * @mixes DisplayAutomation
 * @mixes TriggerAutomation
 * @mixes OverrideCompetenceMechanic
 * @mixes OverrideDataPseudoDocument
 */
export default class UseDocumentsAutomation
  extends mixClasses(
    BaseAutomation,
    CritMechanicMixin,
    SelectionPseudoDocumentMixin,
    automationMixins.DisplayAutomationMixin,
    automationMixins.TriggerAutomationMixin,
    OverrideCompetencePseudoDocumentMixin,
    OverrideDataPseudoDocumentMixin,
  )
{
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AUTOMATIONS.UseDocuments"];

  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.AUTOMATIONS.UseDocuments.LABEL";
  }

  /** @inheritDoc */
  static get metadata() {
    return Object.assign(super.metadata, { type: "useDocuments" });
  }

  /** @inheritDoc */
  static get triggerMetadata() {
    return Object.assign(super.triggerMetadata, { executionTriggers: ["execute"] });
  }

  /** @inheritDoc */
  get _formPaths() {
    return [
      ...this._selectionPaths,
      "hr",
      ...this._triggerDisplayPaths,
      "hr",
      ...this._competencePaths,
      ...this._overrideDataPaths,
    ];
  }

  /** @inheritDoc */
  async _getActivations(options = {}) {
    const selections = await this._getSelections({
      relativeTo: options.execution?.actor ?? options.actor ?? this.actor,
    });
    if (!selections.length) { return []; }
    const useOptions = {
      ...this.getUseOptions(),
      competence: this.getCompetence(options),
      edge: options.execution?.edge,
      event: options.execution?.options?.event,
    };
    return selections.map(({ config, document }) => {
      const display = foundry.utils.deepClone(this.display);
      if (document) {
        display.icon = TERIOCK.config.document[document.type]?.icon;
        display.label ||= document.name;
      }
      return new UseDocumentsActivation({ ...config, display, options: useOptions });
    });
  }

  /** @inheritDoc */
  _isSelectable(document) {
    return typeof document?.use === "function";
  }

  /**
   * Get use options.
   * @returns {object}
   */
  getUseOptions() {
    const options = { competence: this.getCompetence() };
    if (this.overrideData) { Object.assign(options, this.data); }
    return options;
  }
}
