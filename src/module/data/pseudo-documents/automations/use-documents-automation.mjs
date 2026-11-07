import { mergeMetadata, mixClasses } from "../../../utils/_module.mjs";
import { expandSelectionSchema, localSelectionSchema } from "../../fields/tools/builders.mjs";
import { UseDocumentsActivation } from "../activations/_module.mjs";
import { OverrideCompetencePseudoDocumentMixin, OverrideDataPseudoDocumentMixin } from "../mixins/_module.mjs";
import { BaseAutomation } from "./abstract/_module.mjs";
import { SelectionAutomationMixin, TriggerAutomationMixin } from "./mixins/_module.mjs";

/**
 * @extends {BaseAutomation}
 * @mixes SelectionAutomation
 * @mixes TriggerAutomation
 * @mixes OverrideCompetenceMechanic
 * @mixes OverrideDataPseudoDocument
 */
export default class UseDocumentsAutomation
  extends mixClasses(
    BaseAutomation,
    SelectionAutomationMixin,
    TriggerAutomationMixin,
    OverrideCompetencePseudoDocumentMixin,
    OverrideDataPseudoDocumentMixin,
  )
{
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AUTOMATIONS.UseDocuments"];

  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, {
    tags: { interactInExecution: true, useInExecution: true },
    type: "useDocuments",
  });

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), expandSelectionSchema(), localSelectionSchema());
  }

  /** @inheritDoc */
  get _formPaths() {
    const paths = [...this._selectionPaths, "hr", ...this._triggerDisplayPaths];
    paths.push("hr", ...this._competencePaths, ...this._overrideDataPaths);
    return paths;
  }

  /** @inheritDoc */
  get _triggerPaths() {
    const paths = super._triggerPaths;
    if (this.interactInExecution) { paths.push("useInExecution"); }
    return paths;
  }

  /** @inheritDoc */
  async _getActivations(options = {}) {
    const selection = await this._resolveSelection(options);
    if (!selection) { return []; }
    const display = {};
    if (selection.document) {
      display.icon = selection.document.system?.metadata?.icon;
      display.label = selection.document.name;
    }
    return [new UseDocumentsActivation({ ...selection.config, display, options: this.getUseOptions(options) })];
  }

  /** @inheritDoc */
  _isSelectable(document) {
    return typeof document?.use === "function";
  }

  /**
   * Get use options.
   * @param {Partial<Teriock.System.TriggerScope>} [scope]
   * @returns {object}
   */
  getUseOptions(scope = {}) {
    return {
      ...(this.overrideData ? this.data : {}),
      competence: this.getCompetence(scope),
      edge: scope.execution?.edge,
      event: scope.execution?.options?.event,
    };
  }

  /** @inheritDoc */
  async interactOnExecutionCompletion(execution) {
    if (!this.useInExecution) { return; }
    const useOptions = this.getUseOptions({ execution });
    const uuids = this._executionSelection?.config.globalUuids ?? [];
    const documents = await Promise.all(uuids.map(uuid => fromUuid(uuid)));
    for (const document of documents.filter(Boolean)) {
      await document.use({ ...useOptions, actor: execution.actor });
    }
  }
}
