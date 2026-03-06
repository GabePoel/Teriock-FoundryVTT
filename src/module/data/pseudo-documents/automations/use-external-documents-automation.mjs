import { selectDocumentsDialog } from "../../../applications/dialogs/select-document-dialog.mjs";
import { CompetenceModel } from "../../models/_module.mjs";
import { BaseAutomation } from "./abstract/_module.mjs";

const { fields } = foundry.data;

/**
 * @property {boolean} automatic
 * @property {CompetenceModel} competence
 * @property {UUID<UsableDocument>[]} documents
 * @property {boolean} multi
 * @property {boolean} noHeighten
 * @property {boolean} overrideCompetence
 */
export default class UseExternalDocumentsAutomation extends BaseAutomation {
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
      automatic: new fields.BooleanField(),
      competence: new fields.EmbeddedDataField(CompetenceModel),
      documents: new fields.SetField(new fields.DocumentUUIDField()),
      multi: new fields.BooleanField(),
      noHeighten: new fields.BooleanField(),
      overrideCompetence: new fields.BooleanField(),
    });
  }

  /** @inheritDoc */
  get _formPaths() {
    const paths = [
      "documents",
      "multi",
      "automatic",
      "noHeighten",
      "overrideCompetence",
    ];
    if (this.overrideCompetence) paths.push("competence.raw");
    return paths;
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
        showDialog: game.settings.get("teriock", "showRollDialogs"),
      },
      options,
    );
    const validDocuments = (
      await Promise.all(this.documents.map((uuid) => fromUuid(uuid)))
    ).filter((d) => d && typeof d.use === "function");
    if (validDocuments.length === 0) return;
    if (this.automatic && validDocuments.length === 1) {
      await validDocuments[0].use(options);
      return;
    }
    const chosen = await selectDocumentsDialog(validDocuments, {
      multi: this.multi,
      title: this.document.nameString || this.document.name,
    });
    await Promise.all(chosen.map((c) => c.use(options)));
  }
}
