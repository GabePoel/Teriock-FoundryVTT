import { resolveDocument } from "../../../helpers/resolve.mjs";
import { mix } from "../../../helpers/utils.mjs";
import { UseExternalActivation } from "../activations/command-activations.mjs";
import { BaseAutomation } from "./abstract/_module.mjs";
import {
  ExternalDocumentsAutomationMixin,
  UseDocumentsAutomationMixin,
} from "./mixins/_module.mjs";

const { fields } = foundry.data;

/**
 * @property {boolean} noHeighten
 * @property {boolean} expandTables
 * @extends {BaseAutomation}
 * @mixes ExternalDocumentsAutomation
 * @mixes CompetenceAutomation
 * @mixes UseDocumentsAutomation
 */
export default class UseExternalDocumentsAutomation extends mix(
  BaseAutomation,
  ExternalDocumentsAutomationMixin,
  UseDocumentsAutomationMixin,
) {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "TERIOCK.AUTOMATIONS.UseExternalDocuments",
  ];

  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.AUTOMATIONS.UseExternalDocuments.LABEL";
  }

  /** @inheritDoc */
  static get TYPE() {
    return "useExternal";
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      expandTables: new fields.BooleanField(),
      noHeighten: new fields.BooleanField(),
    });
  }

  /** @inheritDoc */
  get _formPaths() {
    return [...super._formPaths, "noHeighten", "expandTables"];
  }

  /**
   * Make an activation for a given document.
   * @param {UUID<AnyChildDocument>} uuid
   * @returns {Promise<UseExternalActivation>}
   */
  async #makeActivation(uuid) {
    const doc = await resolveDocument(uuid);
    const title = doc.name;
    const symbol = TERIOCK.options.document[doc.type]?.icon;
    return new UseExternalActivation({
      title,
      symbol,
      options: {
        uuid,
        competence: this.overrideCompetence
          ? this.competence.raw
          : this.document.system.competence.raw,
        expandTables: this.expandTables,
        noHeighten: this.noHeighten,
      },
    });
  }

  /** @inheritDoc */
  async _getActivations() {
    return Promise.all(
      Array.from(this.documents).map((d) => this.#makeActivation(d)),
    );
  }

  /** @inheritDoc */
  async getDocuments(options = {}) {
    const out = await super.getDocuments(options);
    return out.filter((d) => d && typeof d.use === "function");
  }
}
