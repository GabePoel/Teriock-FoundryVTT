import piercingConfig from "../../../constants/config/piercing-config.mjs";
import { objectMap } from "../../../helpers/utils.mjs";
import { BaseDataModel } from "../../abstract/_module.mjs";

const { fields } = foundry.data;

/**
 * Model for a common implementation of piercing settings.
 * @property {Teriock.System.PiercingLevel} raw
 * @implements {Teriock.Functionality.ScalingModel}
 */
export default class PiercingModel extends BaseDataModel {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.MODELS.Piercing"];

  /** @inheritDoc */
  static defineSchema() {
    return {
      raw: new fields.NumberField({
        choices: objectMap(piercingConfig.levels, (v) => v.label, { localize: true, sort: false }),
        initial: 0,
        max: 2,
        min: 0,
        nullable: false,
        required: false,
      }),
    };
  }

  /**
   * Whether this is AV0.
   * @returns {boolean}
   */
  get av0() {
    return this.raw >= 1;
  }

  /** @inheritDoc */
  get icon() {
    return piercingConfig.levels[this.value].icon;
  }

  /** @inheritDoc */
  get label() {
    return this.value >= 1 ? piercingConfig.levels[this.value].label : "";
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
   * @returns {Teriock.System.PiercingLevel}
   */
  get value() {
    if (this.ub) { return 2; }
    if (this.av0) { return 1; }
    return 0;
  }
}
