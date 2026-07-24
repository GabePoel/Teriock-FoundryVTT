import { localizeChoices } from "../../../helpers/localization.mjs";
import { CompetenceModel } from "../../models/_module.mjs";

const { fields } = foundry.data;

/**
 * Adds an optional competence override to a {@link MechanicPseudoDocument}.
 * @param {typeof MechanicPseudoDocument} Base
 */
export default function OverrideCompetenceMechanicMixin(Base) {
  return (
    /**
     * @mixin
     * @property {CompetenceModel} competence
     * @property {""|"override"|"inherit"} setCompetence
     */
    class OverrideCompetenceMechanic extends Base {
      /** @inheritDoc */
      static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AUTOMATIONS.Competence"];

      /**
       * The initial setCompetence value.
       * @returns {""|"override"|"inherit"}
       */
      static get _setCompetenceInitial() {
        return "";
      }

      /** @inheritDoc */
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          competence: new fields.EmbeddedDataField(CompetenceModel),
          setCompetence: new fields.StringField({
            blank: true,
            choices: localizeChoices({
              inherit: "TERIOCK.AUTOMATIONS.Competence.FIELDS.setCompetence.choices.inherit",
              override: "TERIOCK.AUTOMATIONS.Competence.FIELDS.setCompetence.choices.override",
            }, { none: true, sort: false }),
            initial: this._setCompetenceInitial,
            nullable: false,
            required: true,
          }),
        });
      }

      /** @inheritDoc */
      static migrateData(source, options, state) {
        if (source.setCompetence === "none") { source.setCompetence = ""; }
        return super.migrateData(source, options, state);
      }

      /**
       * Competence paths.
       * @returns {string[]}
       */
      get _competencePaths() {
        const paths = ["setCompetence"];
        if (this.setCompetence === "override") { paths.push("competence.raw"); }
        return paths;
      }

      /** @inheritDoc */
      get _formPaths() {
        return [...super._formPaths, ...this._competencePaths];
      }

      /** @inheritDoc */
      getCompetence(scope) {
        if (this.setCompetence === "inherit" && (scope?.execution?.competence || this.document?.system?.competence)) {
          return scope?.execution?.competence?.value ?? this.document?.system?.competence?.value;
        }
        if (this.setCompetence === "override") { return this.competence.value; }
        return undefined;
      }
    }
  );
}
