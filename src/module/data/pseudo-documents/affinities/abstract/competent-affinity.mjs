import { omit } from "../../../../helpers/utils.mjs";
import { OverrideCompetenceMechanicMixin } from "../../mixins/_module.mjs";
import BaseAffinity from "./base-affinity.mjs";

/**
 * An affinity that is rolled, and so applies at the competence of whatever it comes from.
 * @extends {BaseAffinity}
 * @mixes OverrideCompetenceMechanic
 */
export default class CompetentAffinity extends OverrideCompetenceMechanicMixin(BaseAffinity) {
  /** @inheritDoc */
  static defineSchema() {
    return omit(super.defineSchema(), ["inheritCompetence"]);
  }

  /** @inheritDoc */
  get _competencePaths() {
    const paths = ["overrideCompetence"];
    if (this.overrideCompetence) { paths.push("competence.raw"); }
    return paths;
  }

  /** @inheritDoc */
  getCompetence(scope) {
    if (this.overrideCompetence) { return this.competence.value; }
    return this.document?.system?.competence?.value ?? super.getCompetence(scope);
  }
}
