import { competenceField } from "../fields/helpers/builders.mjs";
import EmbeddedDataModel from "./embedded-data-model.mjs";

/**
 * Model for common implementation of piercing settings.
 * @extends {Teriock.Models.ScaleModelData}
 * @property {Teriock.System.CompetenceLevel} raw
 * @property {CommonSystem|null} parent
 */
export default class CompetenceModel extends EmbeddedDataModel {
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
    return !!(this.raw >= 2 || this.document?.elder?.system?.competence?.fluent);
  }

  /**
   * Icon that represents this.
   * @returns {string}
   */
  get icon() {
    if (this.fluent) { return TERIOCK.display.icons.competence.fluent; }
    if (this.proficient) { return TERIOCK.display.icons.competence.proficient; }
    return TERIOCK.display.icons.competence.none;
  }

  /**
   * A label that describes this.
   * @returns {string}
   */
  get label() {
    return TERIOCK.config.competence.levels[this.value].label;
  }

  /**
   * Whether this is proficient.
   * @returns {boolean}
   */
  get proficient() {
    return !!(this.raw >= 1 || this.document?.elder?.system?.competence?.proficient);
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
