import { mixClasses } from "../../../helpers/construction.mjs";
import { UseDocumentsActivation } from "../activations/_module.mjs";
import {
  OverrideCompetencePseudoDocumentMixin,
  OverrideDataPseudoDocumentMixin,
  SelectionPseudoDocumentMixin,
} from "../mixins/_module.mjs";
import { BaseAutomation } from "./abstract/_module.mjs";
import { DisplayAutomationMixin, TriggerAutomationMixin } from "./mixins/_module.mjs";

/**
 * @mixes SelectionPseudoDocument
 * @mixes DisplayAutomation
 * @mixes TriggerAutomation
 * @mixes OverrideCompetenceMechanic
 * @mixes OverrideDataPseudoDocument
 */
export default class UseDocumentsAutomation
  extends mixClasses(
    BaseAutomation,
    SelectionPseudoDocumentMixin,
    DisplayAutomationMixin,
    TriggerAutomationMixin,
    OverrideCompetencePseudoDocumentMixin,
    OverrideDataPseudoDocumentMixin,
  )
{
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AUTOMATIONS.UseDocuments"];

  /** @inheritDoc */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, {
      tags: { interactInExecution: true, useInExecution: true },
      type: "useDocuments",
    });
  }

  /** @type {{ config: object, document: TeriockDocument|null }[]|null} */
  #selections = null;

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
    const selections = this.#selections
      ?? await this._getSelections({ relativeTo: options.execution?.actor ?? options.actor ?? this.actor });
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

  /** @inheritDoc */
  async interactOnExecutionCompletion(execution) {
    if (!this.useInExecution) { return; }
    const useOptions = {
      ...this.getUseOptions(),
      competence: this.getCompetence({ execution }),
      edge: execution.edge,
      event: execution.options?.event,
    };
    for (const { config } of this.#selections ?? []) {
      const documents = await Promise.all((config.globalUuids ?? []).map(uuid => fromUuid(uuid)));
      for (const document of documents.filter(Boolean)) {
        await document.use({ ...useOptions, actor: execution.actor });
      }
    }
  }

  /** @inheritDoc */
  async interactOnExecutionInput(execution) {
    this.#selections = this.interactInExecution ? await this._getSelections({ relativeTo: execution.actor }) : null;
  }
}
