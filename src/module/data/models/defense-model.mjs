import { toInt } from "../../helpers/string.mjs";
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
      raw: new fields.NumberField({ initial: 0, nullable: false }),
    });
  }

  /** @inheritDoc */
  static migrateData(source, options, state) {
    if (typeof source.raw === "string") { source.raw = toInt(source.raw); }
    return super.migrateData(source, options, state);
  }

  /**
   * Total defense model value.
   * @returns {number}
   */
  get value() {
    return this.raw + this.bonus;
  }
}
