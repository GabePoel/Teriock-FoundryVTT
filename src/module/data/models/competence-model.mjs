import { makeIconClass } from "../../helpers/utils.mjs";
import EmbeddedDataModel from "./embedded-data-model.mjs";

const { fields } = foundry.data;

//noinspection JSClosureCompilerSyntax,JSUnusedGlobalSymbols
/**
 * Model for common implementation of piercing settings.
 * @implements {Teriock.Models.ScaleModelInterface}
 */
export default class CompetenceModel extends EmbeddedDataModel {
  static defineSchema() {
    return {
      raw: new fields.NumberField({
        choices: {
          0: "None",
          1: "Proficient",
          2: "Fluent",
        },
        hint: "If this is proficient or fluent.",
        initial: 0,
        label: "Competence",
        max: 2,
        min: 0,
        nullable: false,
        required: false,
      }),
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
    if (this.fluent) return "award";
    if (this.proficient) return "award-simple";
    return "certificate";
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
