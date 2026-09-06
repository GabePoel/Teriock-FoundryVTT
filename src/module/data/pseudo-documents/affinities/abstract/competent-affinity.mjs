import { mixClasses } from "../../../../helpers/construction.mjs";
import { OverrideCompetencePseudoDocumentMixin } from "../../mixins/_module.mjs";
import BaseAffinity from "./base-affinity/base-affinity.mjs";

/**
 * An affinity that is rolled, and so applies at the competence of whatever it comes from.
 * @mixes OverrideCompetenceMechanic
 */
export default class CompetentAffinity extends mixClasses(BaseAffinity, OverrideCompetencePseudoDocumentMixin) {
  /** @inheritDoc */
  static get _setCompetenceInitial() {
    return "inherit";
  }
}
