import BaseUnitModel from "./base-unit-model/base-unit-model.mjs";

export default class CurrencyUnitModel extends BaseUnitModel {
  /** @inheritDoc */
  static get _rawDeterministic() {
    return true;
  }

  /**
   * @inheritDoc
   * @returns {Teriock.Units.UnitEntry[]}
   */
  static get finiteChoiceEntries() {
    return this._getEntriesFromConfig(TERIOCK.CONFIG.currency);
  }

  /**
   * @inheritDoc
   * @returns {Teriock.Units.UnitEntry[]}
   */
  static get infiniteChoiceEntries() {
    return [];
  }

  /**
   * @inheritDoc
   * @returns {Teriock.Units.UnitEntry[]}
   */
  static get zeroChoiceEntries() {
    return [{ id: "none", label: "TERIOCK.MODELS.CurrencyUnit.UNITS.none.label" }];
  }

  /** @inheritDoc */
  get icon() {
    return TERIOCK.DISPLAY.icons.manifest.stat.gp;
  }
}
