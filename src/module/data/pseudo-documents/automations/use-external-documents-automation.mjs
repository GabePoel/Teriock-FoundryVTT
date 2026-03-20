import { CompetenceModel } from "../../models/_module.mjs";
import { BaseAutomation } from "./abstract/_module.mjs";
import { ExternalDocumentsAutomationMixin } from "./mixins/_module.mjs";

const { fields } = foundry.data;

/**
 * @property {CompetenceModel} competence
 * @property {boolean} noHeighten
 * @property {boolean} overrideCompetence
 * @property {boolean} expandTables
 */
export default class UseExternalDocumentsAutomation extends ExternalDocumentsAutomationMixin(
  BaseAutomation,
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
      competence: new fields.EmbeddedDataField(CompetenceModel),
      expandTables: new fields.BooleanField(),
      noHeighten: new fields.BooleanField(),
      overrideCompetence: new fields.BooleanField(),
    });
  }

  /** @inheritDoc */
  get _formPaths() {
    const paths = [
      ...super._formPaths,
      "expandTables",
      "noHeighten",
      "overrideCompetence",
    ];
    if (this.overrideCompetence) paths.push("competence.raw");
    return paths;
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
