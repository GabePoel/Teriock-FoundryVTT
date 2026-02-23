import UnitModel from "./unit-model.mjs";

export default class TimeUnitModel extends UnitModel {
  /**
   * @inheritDoc
   * @returns {Teriock.Units.UnitEntry[]}
   */
  static get finiteChoiceEntries() {
    return [
      {
        conversion: 1,
        id: "second",
        label: "TERIOCK.MODELS.TimeUnit.UNITS.second.label",
        plural: "TERIOCK.MODELS.TimeUnit.UNITS.second.plural",
        symbol: "s",
      },
      {
        conversion: 60,
        id: "minute",
        label: "TERIOCK.MODELS.TimeUnit.UNITS.minute.label",
        plural: "TERIOCK.MODELS.TimeUnit.UNITS.minute.plural",
        symbol: "min",
      },
      {
        conversion: 60 * 60,
        id: "hour",
        label: "TERIOCK.MODELS.TimeUnit.UNITS.hour.label",
        plural: "TERIOCK.MODELS.TimeUnit.UNITS.hour.plural",
        symbol: "hr",
      },
      {
        conversion: 60 * 60 * 24,
        id: "day",
        label: "TERIOCK.MODELS.TimeUnit.UNITS.day.label",
        plural: "TERIOCK.MODELS.TimeUnit.UNITS.day.plural",
      },
      {
        conversion: 60 * 60 * 24 * 7,
        id: "week",
        label: "TERIOCK.MODELS.TimeUnit.UNITS.week.label",
        plural: "TERIOCK.MODELS.TimeUnit.UNITS.week.plural",
        symbol: "wk",
      },
      {
        conversion: 60 * 60 * 24 * 365.25,
        id: "year",
        label: "TERIOCK.MODELS.TimeUnit.UNITS.year.label",
        plural: "TERIOCK.MODELS.TimeUnit.UNITS.year.plural",
        symbol: "yr",
      },
    ];
  }

  /** @inheritDoc */
  get icon() {
    return "timer";
  }
}
