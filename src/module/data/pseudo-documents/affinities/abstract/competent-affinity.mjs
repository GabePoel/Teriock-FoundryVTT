import { OverrideCompetenceMechanicMixin } from "../../mixins/_module.mjs";
import BaseAffinity from "./base-affinity.mjs";

/**
 * An affinity that is rolled, and so applies at the competence of whatever it comes from.
 * @extends {BaseAffinity}
 * @mixes OverrideCompetenceMechanic
 */
export default class CompetentAffinity extends OverrideCompetenceMechanicMixin(BaseAffinity) {
  /** @inheritDoc */
  static get _setCompetenceInitial() {
    return "inherit";
  }
}
