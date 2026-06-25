import TimeUnitModel from "./time-unit-model.mjs";

export default class DurationModel extends TimeUnitModel {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.MODELS.Duration"];

  /**
   * @inheritDoc
   * @returns {Teriock.Units.UnitEntry[]}
   */
  static get infiniteChoiceEntries() {
    return [...super.infiniteChoiceEntries, { id: "passive", label: "TERIOCK.MODELS.Duration.UNITS.passive" }];
  }

  /**
   * @inheritDoc
   * @returns {Teriock.Units.UnitEntry[]}
   */
  static get zeroChoiceEntries() {
    return [{ id: "instant", label: "TERIOCK.MODELS.Duration.UNITS.instant" }];
  }

  /** @inheritDoc */
  get icon() {
    return TERIOCK.display.icons.ability.duration;
  }

  /** @inheritDoc */
  get text() {
    if (this.unit === "passive") { return _loc("TERIOCK.MODELS.Duration.UNITS.alwaysActive"); }
    return super.text;
  }
}
