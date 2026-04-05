import { CompetenceModel } from "../../../models/_module.mjs";

const { fields } = foundry.data;

/**
 * @param {typeof BaseAutomation} Base
 */
export default function CompetenceAutomationMixin(Base) {
  return (
    /**
     * @property {CompetenceModel} competence
     * @property {boolean} overrideCompetence
     * @mixin
     */
    class CompetenceAutomation extends Base {
      /** @inheritDoc */
      static LOCALIZATION_PREFIXES = [
        ...super.LOCALIZATION_PREFIXES,
        "TERIOCK.AUTOMATIONS.CompetenceAutomation",
      ];

      /** @inheritDoc */
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          competence: new fields.EmbeddedDataField(CompetenceModel),
          overrideCompetence: new fields.BooleanField(),
        });
      }

      /**
       * Competence paths.
       * @returns {string[]}
       */
      get _competencePaths() {
        const paths = ["overrideCompetence"];
        if (this.overrideCompetence) paths.push("competence.raw");
        return paths;
      }

      /** @inheritDoc */
      get _formPaths() {
        return [...super._formPaths, ...this._competencePaths];
      }
    }
  );
}
