import EmbeddedDataModel from "./embedded-data-model.mjs";

const { fields } = foundry.data;

//noinspection JSClosureCompilerSyntax
/**
 * Model for common implementation of piercing settings.
 * @implements {Teriock.Models.ScaleModelInterface}
 * @property {Teriock.System.PiercingLevel} raw
 */
export default class PiercingModel extends EmbeddedDataModel {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "TERIOCK.MODELS.Piercing",
  ];

  /** @inheritDoc */
  static defineSchema() {
    return {
      raw: new fields.NumberField({
        choices: {
          0: game.i18n.localize("TERIOCK.MODELS.Piercing.MENU.0"),
          1: game.i18n.localize("TERIOCK.MODELS.Piercing.MENU.1"),
          2: game.i18n.localize("TERIOCK.MODELS.Piercing.MENU.2"),
        },
        initial: 0,
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
