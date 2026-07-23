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
     * @property {boolean} inheritCompetence
     * @property {boolean} overrideCompetence
     */
    class OverrideCompetenceMechanic extends Base {
      /** @inheritDoc */
      static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AUTOMATIONS.Competence"];

      /** @inheritDoc */
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          competence: new fields.EmbeddedDataField(CompetenceModel),
          inheritCompetence: new fields.BooleanField(),
          overrideCompetence: new fields.BooleanField(),
        });
      }

      /**
       * Competence paths.
       * @returns {string[]}
       */
      get _competencePaths() {
        const paths = [];
        if (!this.overrideCompetence) { paths.push("inheritCompetence"); }
        if (!this.inheritCompetence) { paths.push("overrideCompetence"); }
        if (this.overrideCompetence) { paths.push("competence.raw"); }
        return paths;
      }

      /** @inheritDoc */
      get _formPaths() {
        return [...super._formPaths, ...this._competencePaths];
      }

      /** @inheritDoc */
      getCompetence(scope) {
        if (this.inheritCompetence && (scope?.execution?.competence || this.document?.system?.competence)) {
          return scope?.execution?.competence?.value ?? this.document?.system?.competence?.value;
        }
        if (this.overrideCompetence) { return this.competence.value; }
        return undefined;
      }

      /** @inheritDoc */
      prepareData() {
        super.prepareData();
        if (this.inheritCompetence) { this.overrideCompetence = false; }
        if (this.overrideCompetence) { this.inheritCompetence = false; }
      }
    }
  );
}
