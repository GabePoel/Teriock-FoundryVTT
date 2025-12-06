import { EvaluationField, FormulaField } from "../../fields/_module.mjs";
import EmbeddedDataModel from "../embedded-data-model/embedded-data-model.mjs";

const { fields } = foundry.data;

/**
 * Model that provides useful getters for equipment that stores other equipment.
 */
export default class StorageModel extends EmbeddedDataModel {
  /** @inheritDoc */
  static defineSchema() {
    return {
      enabled: new fields.BooleanField({
        hint: "If this should be able to store other equipment within it.",
        initial: false,
        label: "Storage",
        required: false,
      }),
      maxCount: new EvaluationField({
        blank: Infinity,
      }),
      maxWeight: new EvaluationField({
        blank: Infinity,
      }),
      weightMultiplier: new FormulaField({
        deterministic: true,
        initial: "1",
      }),
    };
  }

  /**
   * If this is over its weight capacity.
   * @returns {boolean}
   */
  get isOverWeightCapacity() {
    return this.carriedWeight > this.maxWeight.value;
  }

  /**
   * If this is over its count capacity.
   * @returns {boolean}
   */
  get isOverCountCapacity() {
    return this.carriedCount > this.maxCount.value;
  }

  /**
   * Count of items carried.
   * @returns {number}
   */
  get carriedCount() {
    return this.parent.parent.equipment
      .map((e) => (e.system?.consumable ? e.system?.quantity : 1) || 1)
      .reduce((a, b) => a + b, 0);
  }

  /**
   * Weight of items carried.
   * @returns {number}
   */
  get carriedWeight() {
    return this.parent.parent.equipment
      .map((e) => e.system?.weight?.total || 0)
      .reduce((a, b) => a + b, 0);
  }

  /**
   * If this is over its capacity.
   * @returns {boolean}
   */
  get isOverCapacity() {
    return this.isOverCountCapacity || this.isOverWeightCapacity;
  }
}
