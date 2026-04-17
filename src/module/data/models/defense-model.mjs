import { initialNumber } from "../fields/helpers/initializers.mjs";
import EmbeddedDataModel from "./embedded-data-model.mjs";

const { fields } = foundry.data;

/**
 * @property {number} bonus
 * @property {number} raw
 */
export default class DefenseModel extends EmbeddedDataModel {
  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      bonus: initialNumber(0),
      raw: new fields.NumberField({ initial: 0, nullable: false }),
    });
  }

  /** @inheritDoc */
  static migrateData(data) {
    if (typeof data.raw === "string") {
      const n = Number(data.raw);
      data.raw = isNaN(n) ? 0 : n;
    }
    return super.migrateData(data);
  }

  /**
   * Total defense model value.
   * @returns {number}
   */
  get value() {
    return this.raw + this.bonus;
  }
}
