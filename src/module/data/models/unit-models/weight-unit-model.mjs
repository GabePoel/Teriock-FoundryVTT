import BaseUnitModel from "./base-unit-model/base-unit-model.mjs";

export default class WeightUnitModel extends BaseUnitModel {
  /** @inheritDoc */
  static get _initialUnit() {
    return "lb";
  }

  /** @inheritDoc */
  static get _rawDeterministic() {
    return true;
  }

  /**
   * @inheritDoc
   * @returns {Teriock.Units.UnitEntry[]}
   */
  static get finiteChoiceEntries() {
    return this._getEntriesFromConfig(TERIOCK.CONFIG.weight);
  }

  /**
   * @inheritDoc
   * @returns {Teriock.Units.UnitEntry[]}
   */
  static get infiniteChoiceEntries() {
    return [];
  }

  /** @inheritDoc */
  get icon() {
    return TERIOCK.DISPLAY.icons.manifest.equipment.weight;
  }
}
