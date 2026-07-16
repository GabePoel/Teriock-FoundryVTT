import { mixClasses } from "../../../helpers/construction.mjs";
import { resolveDocument } from "../../../helpers/resolve.mjs";
import { UseExternalActivation, UseLocalActivation } from "../activations/command-activations.mjs";
import { OverrideCompetenceMechanicMixin } from "../mixins/_module.mjs";
import { BaseAutomation } from "./abstract/_module.mjs";
import * as automationMixins from "./mixins/_module.mjs";

const { fields } = foundry.data;

/**
 * @extends {BaseAutomation}
 * @mixes OverrideAutomation
 * @mixes OverrideCompetenceMechanic
 * @mixes SelectDocumentsAutomation
 * @mixes TriggerAutomation
 * @property {boolean} expandTables
 */
export default class UseDocumentsAutomation
  extends mixClasses(
    BaseAutomation,
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
    return Object.assign(super.triggerMetadata, { executionOnly: true });
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
   * @returns {Promise<UseExternalActivation>}
   */
  async #makeExternalActivation(uuid) {
    const doc = await resolveDocument(uuid);
    const label = _loc("TERIOCK.COMMANDS.UseDocument.useNamed", { name: doc.name || "" });
    const icon = TERIOCK.config.document[doc.type]?.icon;
    return new UseExternalActivation({
      display: { icon: TERIOCK.config.document[doc.type]?.icon, label: doc.name },
      options: { ...this.getUseOptions(), expandTables: this.expandTables, icon, label, uuid },
    });
  }

  /**
   * Make a local activation for a given identifier.
   * @param {TypedIdentifier|Identifier} identifier
   * @returns {UseLocalActivation}
   */
  #makeLocalActivation(identifier) {
    return new UseLocalActivation({ options: { ...this.getUseOptions(), lookup: identifier } });
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
  async _getActivations() {
    const external = Promise.all(Array.from(this.uuids).map(d => this.#makeExternalActivation(d)));
    const local = this.local.identifiers.map(i => this.#makeLocalActivation(i));
    return [...(await external), ...local];
  }

  /** @inheritDoc */
  async _preFire(scope) {
    await this.executeDocuments(scope);
  }

  /**
   * Execute the documents.
   * @param {Teriock.System.TriggerScope} scope
   * @return {Promise<void>}
   */
  async executeDocuments(scope = {}) {
    const actor = scope.execution?.actor ?? this.actor;
    await this.use({
      actor,
      competence: this.getCompetence(scope),
      edge: scope.execution?.edge,
      event: scope.execution?.options?.event,
    });
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

  /**
   * Use specified documents with the provided options.
   * @param {object} options
   * @returns {Promise<void>}
   */
  async use(options = {}) {
    options = Object.assign(this.getUseOptions(), options);
    if (options.actor == null) { options.actor = this.actor ?? this.document?.actor ?? null; }
    const chosen = await this._choose({ actor: options.actor, expandFolders: true, expandTables: this.expandTables });
    if (this.automatic && chosen.length === 1) { await chosen[0].use(options); }
    else { await Promise.all(chosen.map(c => c.use(options))); }
  }
}
