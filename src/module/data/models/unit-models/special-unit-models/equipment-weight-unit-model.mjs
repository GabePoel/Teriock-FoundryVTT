import WeightUnitModel from "../normal-unit-models/weight-unit-model.mjs";

/**
 * Weight of a piece of equipment.
 * @property {EquipmentSystem} parent
 */
export default class EquipmentWeightUnitModel extends WeightUnitModel {
  /**
   * How much to adjust the weight of this by.
   * @returns {number}
   */
  get multiplier() {
    const elder = this.getNearestDocument()?.elder;
    if (elder?.type === "equipment") { return elder.system?.storage?.weight?.multiplier ?? 1; }
    return 1;
  }

  /**
   * The total weight of this equipment and everything it carries.
   * @returns {number}
   */
  get total() {
    const system = this.parent;
    if (!system || system.stashed || system.parent.elder?.type === "species") { return 0; }
    let total = this.value * (system.consumption.enabled ? system.quantity.value : 1) * this.multiplier;
    if (system.storage.enabled) { total += system.storage.weight.value; }
    return total.toNearest(TERIOCK.CONST.UNIT_PRECISION);
  }
}
