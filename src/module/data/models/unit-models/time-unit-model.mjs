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
        label: "Second",
        plural: "Seconds",
        symbol: "s",
      },
      {
        conversion: 60,
        id: "minute",
        label: "Minute",
        plural: "Minutes",
        symbol: "min",
      },
      {
        conversion: 60 * 60,
        id: "hour",
        label: "Hour",
        plural: "Hours",
        symbol: "hr",
      },
      {
        conversion: 60 * 60 * 24,
        id: "day",
        label: "Day",
        plural: "Days",
      },
      {
        conversion: 60 * 60 * 24 * 7,
        id: "week",
        label: "Week",
        plural: "Weeks",
        symbol: "wk",
      },
      {
        conversion: 60 * 60 * 24 * 365.25,
        id: "year",
        label: "Year",
        plural: "Years",
        symbol: "yr",
      },
    ];
  }

  /** @inheritDoc */
  get icon() {
    return "timer";
  }
}
