import BaseUnitModel from "./base-unit-model/base-unit-model.mjs";
import WeightUnitModel from "./weight-unit-model.mjs";

/**
 * A weight model with special handling for going infinite.
 */
export default class StorageMaxWeightModel extends WeightUnitModel {
  /** @inheritDoc */
  static get _initialUnit() {
    return "unlimited";
  }

  /**
   * @inheritDoc
   * @returns {Teriock.Units.UnitEntry[]}
   */
  static get infiniteChoiceEntries() {
    return BaseUnitModel.infiniteChoiceEntries;
  }

  /** @inheritDoc */
  get icon() {
    return TERIOCK.DISPLAY.icons.manifest.equipment.maxWeight;
  }
}
