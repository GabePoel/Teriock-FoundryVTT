import { mix } from "../../../helpers/utils.mjs";
import { BaseAutomation } from "./abstract/_module.mjs";
import {
  CompetenceAutomationMixin,
  ExternalDocumentsAutomationMixin,
} from "./mixins/_module.mjs";

const { fields } = foundry.data;

/**
 * @property {boolean} noHeighten
 * @property {boolean} expandTables
 * @extends {BaseAutomation}
 * @mixes ExternalDocumentsAutomation
 * @mixes CompetenceAutomation
 */
export default class UseExternalDocumentsAutomation extends mix(
  BaseAutomation,
  ExternalDocumentsAutomationMixin,
  CompetenceAutomationMixin,
) {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "TERIOCK.AUTOMATIONS.UseExternalDocumentsAutomation",
  ];

  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.AUTOMATIONS.UseExternalDocumentsAutomation.LABEL";
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

  /** @inheritDoc */
  async getDocuments(options = {}) {
    const out = await super.getDocuments(options);
    return out.filter((d) => d && typeof d.use === "function");
  }

  /**
   * Use specified documents with the provided options.
   * @param {object} options
   * @returns {Promise<void>}
   */
  async use(options = {}) {
    const proficient = this.overrideCompetence
      ? this.competence.proficient
      : this.document.system.competence.proficient;
    const fluent = this.overrideCompetence
      ? this.competence.fluent
      : this.document.system.competence.fluent;
    options = Object.assign(
      {
        actor: this.document.actor,
        fluent,
        noHeighten: this.noHeighten,
        proficient,
        showDialog: game.teriock.getSetting("showRollDialogs"),
      },
      options,
    );
    const chosen = await this._choose({
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
