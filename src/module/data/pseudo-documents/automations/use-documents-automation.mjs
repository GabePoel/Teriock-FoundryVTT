import { mixClasses } from "../../../helpers/construction.mjs";
import { resolveDocument } from "../../../helpers/resolve.mjs";
import { UseExternalActivation } from "../activations/command-activations.mjs";
import { CritMechanicMixin, OverrideCompetenceMechanicMixin } from "../mixins/_module.mjs";
import { BaseAutomation } from "./abstract/_module.mjs";
import * as automationMixins from "./mixins/_module.mjs";

const { fields } = foundry.data;

/**
 * @extends {BaseAutomation}
 * @mixes CritMechanic
 * @mixes SelectDocumentsAutomation
 * @mixes TriggerAutomation
 * @mixes OverrideCompetenceMechanic
 * @mixes OverrideDataAutomation
 * @property {boolean} expandTables
 */
export default class UseDocumentsAutomation
  extends mixClasses(
    BaseAutomation,
    CritMechanicMixin,
    automationMixins.SelectDocumentsAutomationMixin,
    automationMixins.TriggerAutomationMixin,
    OverrideCompetenceMechanicMixin,
    automationMixins.OverrideDataAutomationMixin,
  )
{
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AUTOMATIONS.UseDocuments"];

  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.AUTOMATIONS.UseDocuments.LABEL";
  }

  /** @inheritDoc */
  static get triggerMetadata() {
    return Object.assign(super.triggerMetadata, { executionTriggers: ["execute"] });
  }

  /** @inheritDoc */
  static get TYPE() {
    return "useDocuments";
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), { expandTables: new fields.BooleanField() });
  }

  /**
   * Make an activation for a given document.
   * @param {UUID<AnyChildDocument>} uuid
   * @param {object} [useOptions]
   * @returns {Promise<UseExternalActivation>}
   */
  async #makeExternalActivation(uuid, useOptions = {}) {
    const doc = await resolveDocument(uuid);
    const label = _loc("TERIOCK.COMMANDS.UseDocument.useNamed", { name: doc.name || "" });
    const icon = TERIOCK.config.document[doc.type]?.icon;
    return new UseExternalActivation({
      display: { icon: TERIOCK.config.document[doc.type]?.icon, label: doc.name },
      options: { ...this.getUseOptions(), ...useOptions, expandTables: this.expandTables, icon, label, uuid },
    });
  }

  /** @inheritDoc */
  get _formPaths() {
    return [
      ...this._selectionPaths,
      "hr",
      ...this._triggerPaths,
      "hr",
      ...this._competencePaths,
      ...this._overrideDataPaths,
    ];
  }

  /** @inheritDoc */
  get _selectionPaths() {
    return [...super._selectionPaths, "expandTables"];
  }

  /** @inheritDoc */
  async _getActivations(options = {}) {
    const docs = await this._choose({
      actor: options.actor ?? options.execution?.actor,
      execution: options.execution,
      expandFolders: true,
      expandTables: this.expandTables,
    });
    if (!docs.length) { return []; }
    const useOptions = {
      competence: this.getCompetence(options),
      edge: options.execution?.edge,
      event: options.execution?.options?.event,
    };
    return Promise.all(docs.map(d => this.#makeExternalActivation(d.uuid, useOptions)));
  }

  /** @inheritDoc */
  async getDocuments(options = {}) {
    return (await super.getDocuments(options)).filter(d => d && typeof d.use === "function");
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
