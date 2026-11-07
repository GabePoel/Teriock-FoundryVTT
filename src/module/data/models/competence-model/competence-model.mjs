import { BaseDataModel } from "../../abstract/_module.mjs";
import { competenceField } from "../../fields/tools/builders.mjs";

/**
 * Model for a common implementation of competence settings.
 * @implements {Teriock.Functionality.ScalingModel}
 */
export default class CompetenceModel extends BaseDataModel {
  /** @inheritDoc */
  static defineSchema() {
    return { raw: competenceField() };
  }

  /**
   * A descriptive string.
   * @returns {string}
   */
  get description() {
    let out = "TERIOCK.SCHEMA.Competence.choices.0";
    if (this.proficient) { out = "TERIOCK.SCHEMA.Competence.choices.1"; }
    if (this.fluent) { out = "TERIOCK.SCHEMA.Competence.choices.2"; }
    return _loc(out);
  }

  /**
   * Whether this is fluent.
   * @returns {boolean}
   */
  get fluent() {
    return Boolean(this.raw >= 2);
  }

  /**
   * The formula for this competence.
   * @returns {string}
   */
  get formula() {
    if (this.fluent) { return "@f"; }
    if (this.proficient) { return "@p"; }
    return "";
  }

  /** @inheritDoc */
  get icon() {
    return TERIOCK.CONFIG.competence.levels[this.raw].icon;
  }

  /**
   * Filled-circle CSS classes for sheet competence toggles.
   * @returns {string}
   */
  get iconClass() {
    return TERIOCK.CONFIG.competence.levels[this.raw].simpleIconClass;
  }

  /** @inheritDoc */
  get label() {
    return TERIOCK.CONFIG.competence.levels[this.raw].label;
  }

  /**
   * Whether this is proficient.
   * @returns {boolean}
   */
  get proficient() {
    return Boolean(this.raw >= 1);
  }

  /**
   * Numerical score of this competence.
   * @returns {number}
   */
  get value() {
    if (this.fluent) { return this.actor?.system.scaling.f || 0; }
    if (this.proficient) { return this.actor?.system.scaling.p || 0; }
    return 0;
  }
}
