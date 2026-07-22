import { BaseDataModel } from "../../abstract/_module.mjs";
import { competenceField } from "../../fields/tools/builders.mjs";

/**
 * Model for common implementation of piercing settings.
 * @property {Teriock.System.CompetenceLevel} raw
 * @implements {Teriock.Functionality.ScalingModel}
 */
export default class CompetenceModel extends BaseDataModel {
  /** @inheritDoc */
  static defineSchema() {
    return { raw: competenceField() };
  }

  /**
   * Numerical score of this competence.
   * @returns {number}
   */
  get bonus() {
    if (this.fluent) { return this.actor?.system.scaling.f || 0; }
    if (this.proficient) { return this.actor?.system.scaling.p || 0; }
    return 0;
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
    return TERIOCK.config.competence.levels[this.value].icon;
  }

  /**
   * Filled-circle CSS classes for sheet competence toggles.
   * @returns {string}
   */
  get iconClass() {
    return TERIOCK.config.competence.levels[this.value].simpleIconClass;
  }

  /** @inheritDoc */
  get label() {
    return TERIOCK.config.competence.levels[this.value].label;
  }

  /**
   * Whether this is proficient.
   * @returns {boolean}
   */
  get proficient() {
    return Boolean(this.raw >= 1);
  }

  /**
   * A competence value.
   * @returns {Teriock.System.CompetenceLevel}
   */
  get value() {
    if (this.fluent) { return 2; }
    if (this.proficient) { return 1; }
    return 0;
  }
}
