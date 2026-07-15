import { CompetenceMechanicMixin } from "../../mixins/_module.mjs";
import BaseAffinity from "./base-affinity.mjs";

/**
 * An affinity that is rolled, and so applies at the competence of whatever it comes from.
 * @extends {BaseAffinity}
 * @mixes CompetenceMechanic
 */
export default class CompetentAffinity extends CompetenceMechanicMixin(BaseAffinity) {}
