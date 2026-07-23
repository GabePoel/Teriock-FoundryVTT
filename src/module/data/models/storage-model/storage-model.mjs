import { BaseDataModel } from "../../abstract/_module.mjs";

const { fields } = foundry.data;

/**
 * Model that provides useful getters for equipment that stores other equipment.
 * @extends {Teriock.Models.StorageModelData}
 */
export default class StorageModel extends BaseDataModel {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.MODELS.Storage"];

  /** @inheritDoc */
  static defineSchema() {
    return {
      enabled: new fields.BooleanField({ initial: false, required: false }),
      maxCount: new fields.NumberField({ initial: null, nullable: true, required: false }),
      maxWeight: new fields.NumberField({ initial: null, nullable: true, required: false }),
      weightMultiplier: new fields.NumberField({ initial: 1, min: 0 }),
    };
  }

  /**
   * Count of items carried.
   * @returns {number}
   */
  get carriedCount() {
    // Async stored equipment is assumed to have a quantity of 1
    return this.storedEquipment.map(e => (e.system?.consumable ? (e.system?.quantity?.value ?? 1) : 1) || 1).reduce(
      (a, b) => a + b,
      0,
    );
  }

  /**
   * Weight of items carried.
   * @returns {number}
   */
  get carriedWeight() {
    // Async stored equipment is assumed to have a weight of 0
    return this.storedEquipment.map(e => e.system?.totalWeight ?? 0).reduce((a, b) => a + b, 0).toNearest(
      TERIOCK.config.system.unitPrecision,
    );
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

  /**
   * Equipment stored in this storage.
   * @returns {TeriockEquipment[]}
   */
  get storedEquipment() {
    if (!this.enabled) { return []; }
    return this.document.equipment;
  }
}
