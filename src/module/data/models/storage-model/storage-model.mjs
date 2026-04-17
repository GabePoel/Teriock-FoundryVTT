import { equipmentOptions } from "../../../constants/options/equipment-options.mjs";
import { FormulaField } from "../../fields/_module.mjs";
import EmbeddedDataModel from "../embedded-data-model.mjs";

const { fields } = foundry.data;

/**
 * Model that provides useful getters for equipment that stores other equipment.
 * @extends {Teriock.Models.StorageModelData}
 */
export default class StorageModel extends EmbeddedDataModel {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "TERIOCK.MODELS.Storage",
  ];

  /** @inheritDoc */
  static defineSchema() {
    return {
      enabled: new fields.BooleanField({
        initial: false,
        required: false,
      }),
      maxCount: new fields.NumberField({
        initial: null,
        nullable: true,
        required: false,
      }),
      maxWeight: new fields.NumberField({
        initial: null,
        nullable: true,
        required: false,
      }),
      weightMultiplier: new FormulaField({
        deterministic: true,
        initial: "1",
      }),
    };
  }

  /** @type {TeriockEquipment[]} */
  _storedEquipment;

  /**
   * Equipment stored in this storage.
   * @returns {TeriockEquipment[]}
   */
  get storedEquipment() {
    if (!this.enabled) return [];
    if (!this._storedEquipment) this._storedEquipment = this.document.equipment;
    return this._storedEquipment;
  }

  /**
   * Count of items carried.
   * @returns {number}
   */
  get carriedCount() {
    return this.storedEquipment
      .map((e) => (e.system?.consumable ? e.system?.quantity : 1) || 1)
      .reduce((a, b) => a + b, 0);
  }

  /**
   * Weight of items carried.
   * @returns {number}
   */
  get carriedWeight() {
    return this.storedEquipment
      .map((e) => Number(e.system?.totalWeight ?? e.system?.weight))
      .reduce((a, b) => a + b, 0)
      .toNearest(equipmentOptions.weight.interval);
  }

  /**
   * If this is over its capacity.
   * @returns {boolean}
   */
  get isOverCapacity() {
    return this.isOverCountCapacity || this.isOverWeightCapacity;
  }

  /**
   * If this is over its count capacity.
   * @returns {boolean}
   */
  get isOverCountCapacity() {
    return this.maxCount !== null && this.carriedCount > this.maxCount;
  }

  /**
   * If this is over its weight capacity.
   * @returns {boolean}
   */
  get isOverWeightCapacity() {
    return this.maxWeight !== null && this.carriedWeight > this.maxWeight;
  }
}
