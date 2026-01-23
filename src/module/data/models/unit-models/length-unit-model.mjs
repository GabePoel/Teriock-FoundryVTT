import UnitModel from "./unit-model.mjs";

export default class LengthUnitModel extends UnitModel {
  /**
   * @inheritDoc
   * @returns {Teriock.Units.UnitEntry[]}
   */
  static get finiteChoiceEntries() {
    return [
      {
        conversion: 5 / 20,
        id: "cm",
        label: "Centimeter",
        plural: "Centimeters",
        scale: 0,
        system: "metric",
      },
      {
        conversion: 1 / 12,
        id: "in",
        label: "Inch",
        plural: "Inches",
        scale: 0,
        system: "imperial",
      },
      {
        conversion: 1,
        id: "ft",
        label: "Foot",
        plural: "Feet",
        scale: 1,
        symbol: "ft",
        system: "imperial",
      },
      {
        conversion: 5 / 2,
        id: "m",
        label: "Meter",
        plural: "Meters",
        scale: 1,
        system: "metric",
      },
      {
        conversion: 5280,
        id: "mile",
        label: "Mile",
        plural: "Miles",
        scale: 2,
        symbol: "mi",
        system: "imperial",
      },
      {
        conversion: 2500,
        id: "km",
        label: "Kilometer",
        plural: "Kilometers",
        scale: 2,
        system: "metric",
      },
    ];
  }

  /** @inheritDoc */
  get icon() {
    return "ruler-combined";
  }
}
