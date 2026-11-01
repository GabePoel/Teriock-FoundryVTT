import BaseUnitModel from "./base-unit-model/base-unit-model.mjs";

export default class TimeUnitModel extends BaseUnitModel {
  /**
   * @inheritDoc
   * @returns {Teriock.Units.UnitEntry[]}
   */
  static get finiteChoiceEntries() {
    return this._getEntriesFromConfig(TERIOCK.CONFIG.time);
  }

  /** @inheritDoc */
  get icon() {
    return "timer";
  }
}
