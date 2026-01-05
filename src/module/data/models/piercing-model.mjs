import EmbeddedDataModel from "./embedded-data-model.mjs";

const { fields } = foundry.data;

//noinspection JSClosureCompilerSyntax
/**
 * Model for common implementation of piercing settings.
 * @implements {Teriock.Models.ScaleModelInterface}
 */
export default class PiercingModel extends EmbeddedDataModel {
  static defineSchema() {
    return {
      raw: new fields.NumberField({
        choices: {
          0: "None",
          1: "AV0",
          2: "UB",
        },
        hint: "How this interacts with armor and blocking.",
        initial: 0,
        label: "Piercing",
        max: 2,
        min: 0,
        nullable: false,
        required: false,
      }),
    };
  }

  /** @inheritDoc */
  static migrateData(data) {
    if (data.av0 === true) {
      data.raw = 1;
      delete data.av0;
    }
    if (data.ub === true) {
      data.raw = 2;
      delete data.ub;
    }
    return super.migrateData(data);
  }

  /**
   * Whether this is AV0.
   * @returns {boolean}
   */
  get av0() {
    return this.raw >= 1;
  }

  /**
   * Whether this is UB.
   * @returns {boolean}
   */
  get ub() {
    return this.raw >= 2;
  }

  /**
   * A piercing value.
   * @returns {"av0"|"ub"|""}
   */
  get value() {
    if (this.raw === 1) return "av0";
    if (this.raw === 2) return "ub";
    else return "";
  }
}
