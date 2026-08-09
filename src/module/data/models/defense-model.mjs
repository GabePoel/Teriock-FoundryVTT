import { BaseDataModel } from "../abstract/_module.mjs";
import { initialNumber } from "../fields/tools/initializers.mjs";

const { fields } = foundry.data;

/**
 * @property {number} bonus
 * @property {number} raw
 */
export default class DefenseModel extends BaseDataModel {
  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      bonus: initialNumber(0),
      raw: new fields.NumberField({ initial: 0, nullable: false, placeholder: _loc("COMMON.None") }),
    });
  }

  /**
   * Total defense model value.
   * @returns {number}
   */
  get value() {
    return this.raw + this.bonus;
  }
}
