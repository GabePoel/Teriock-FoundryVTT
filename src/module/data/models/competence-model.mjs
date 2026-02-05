import { makeIconClass } from "../../helpers/utils.mjs";
import { competenceField } from "../fields/helpers/builders.mjs";
import EmbeddedDataModel from "./embedded-data-model.mjs";

//noinspection JSClosureCompilerSyntax,JSUnusedGlobalSymbols
/**
 * Model for common implementation of piercing settings.
 * @implements {Teriock.Models.ScaleModelInterface}
 */
export default class CompetenceModel extends EmbeddedDataModel {
  /** @inheritDoc */
  static defineSchema() {
    return {
      raw: competenceField(),
    };
  }

  /**
   * Numerical score of this competence.
   * @returns {number}
   */
  get bonus() {
    if (this.fluent) return this.actor?.system.scaling.f || 0;
    if (this.proficient) return this.actor?.system.scaling.p || 0;
    return 0;
  }

  /**
   * A descriptive string.
   * @returns {string}
   */
  get description() {
    if (this.fluent) return "Fluent";
    if (this.proficient) return "Proficient";
    else return "Normal";
  }

  /**
   * Whether this is fluent.
   * @returns {boolean}
   */
  get fluent() {
    return (
      this.raw >= 2 ||
      this.parent?.parent?.elder?.system.competence?.fluent ||
      false
    );
  }

  /**
   * Icon that represents this.
   * @returns {string}
   */
  get icon() {
    if (this.fluent) return TERIOCK.display.icons.competence.fluent;
    if (this.proficient) return TERIOCK.display.icons.competence.proficient;
    return TERIOCK.display.icons.competence.none;
  }

  /**
   * Icon class that represents this.
   * @returns {string}
   */
  get iconClass() {
    let style = this.fluent ? "solid" : "regular";
    return makeIconClass(this.icon, style);
  }

  /**
   * Whether this is proficient.
   * @returns {boolean}
   */
  get proficient() {
    return (
      this.raw >= 1 ||
      this.parent?.parent?.elder?.system.competence?.proficient ||
      false
    );
  }

  /**
   * A competence value.
   * @returns {"proficient"|"fluent"|""}
   */
  get value() {
    if (this.proficient) return "proficient";
    if (this.fluent) return "fluent";
    else return "";
  }
}
