import { triggers } from "../../../constants/system/_module.mjs";
import { mix } from "../../../helpers/construction.mjs";
import { resolveDocument } from "../../../helpers/resolve.mjs";
import {
  UseExternalActivation,
  UseLocalActivation,
} from "../activations/command-activations.mjs";
import { BaseAutomation } from "./abstract/_module.mjs";
import {
  CompetenceAutomationMixin,
  SelectDocumentsAutomationMixin,
  TriggerAutomationMixin,
} from "./mixins/_module.mjs";

const { fields } = foundry.data;

/**
 * @property {boolean} noHeighten
 * @property {boolean} expandTables
 * @extends {BaseAutomation}
 * @mixes SelectDocumentsAutomation
 * @mixes CompetenceAutomation
 * @mixes TriggerAutomation
 */
export default class UseDocumentsAutomation extends mix(
  BaseAutomation,
  SelectDocumentsAutomationMixin,
  TriggerAutomationMixin,
  CompetenceAutomationMixin,
) {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "TERIOCK.AUTOMATIONS.UseDocuments",
  ];

  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.AUTOMATIONS.UseDocuments.LABEL";
  }

  /** @inheritDoc */
  static get TYPE() {
    return "useDocuments";
  }

  /** @inheritDoc */
  static get _conditions() {
    return false;
  }

  /** @inheritDoc */
  static get _triggerChoices() {
    return {
      execution: triggers.execution,
    };
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      expandTables: new fields.BooleanField(),
      noHeighten: new fields.BooleanField(),
    });
  }

  /** @inheritDoc */
  get _conditions() {
    return false;
  }

  /** @inheritDoc */
  get _formPaths() {
    return [
      ...this._selectionPaths,
      "hr",
      ...this._triggerPaths,
      "hr",
      "noHeighten",
      ...this._competencePaths,
    ];
  }

  /** @inheritDoc */
  get _selectionPaths() {
    return [...super._selectionPaths, "expandTables"];
  }

  /**
   * Make an activation for a given document.
   * @param {UUID<AnyChildDocument>} uuid
   * @returns {Promise<UseExternalActivation>}
   */
  async #makeExternalActivation(uuid) {
    const doc = await resolveDocument(uuid);
    const title = doc.name;
    const symbol = TERIOCK.config.document[doc.type]?.icon;
    return new UseExternalActivation({
      options: {
        competence: this.overrideCompetence
          ? this.competence.raw
          : this.document.system.competence.raw,
        expandTables: this.expandTables,
        noHeighten: this.noHeighten,
        uuid,
      },
      symbol,
      title,
    });
  }

  /**
   * Make a local activation for a given identifier.
   * @param {TypedIdentifier|Identifier} identifier
   * @returns {UseLocalActivation}
   */
  #makeLocalActivation(identifier) {
    return new UseLocalActivation({
      options: {
        competence: this.overrideCompetence
          ? this.competence.raw
          : (this.document?.system?.competence?.raw ?? undefined),
        lookup: identifier,
        noHeighten: this.noHeighten,
      },
    });
  }

  /** @inheritDoc */
  async _getActivations() {
    const external = Promise.all(
      Array.from(this.uuids).map((d) => this.#makeExternalActivation(d)),
    );
    const local = this.identifiers.map((i) => this.#makeLocalActivation(i));
    return [...(await external), ...local];
  }

  /** @inheritDoc */
  async _preFire(scope) {
    if (scope.awaitFire) await this.executeDocuments(scope);
    else this.executeDocuments(scope);
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
      edge: scope.execution?.edge,
      event: scope.execution?.options?.event,
      competence: this.overrideCompetence
        ? this.competence.raw
        : this.document.system.competence.raw,
    });
  }

  /** @inheritDoc */
  async getDocuments(options = {}) {
    return (await super.getDocuments(options)).filter(
      (d) => d && typeof d.use === "function",
    );
  }

  /**
   * Use specified documents with the provided options.
   * @param {object} options
   * @returns {Promise<void>}
   */
  async use(options = {}) {
    options = Object.assign(
      {
        noHeighten: this.noHeighten,
      },
      options,
    );
    if (options.actor == null) {
      options.actor = this.actor ?? this.document?.actor ?? null;
    }
    const chosen = await this._choose({
      actor: options.actor,
      expandFolders: true,
      expandTables: this.expandTables,
    });
    if (this.automatic && chosen.length === 1) {
      await chosen[0].use(options);
    } else {
      await Promise.all(chosen.map((c) => c.use(options)));
    }
  }
}
