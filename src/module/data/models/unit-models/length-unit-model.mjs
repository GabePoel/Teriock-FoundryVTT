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
        label: "TERIOCK.MODELS.LengthUnit.UNITS.cm.label",
        plural: "TERIOCK.MODELS.LengthUnit.UNITS.cm.plural",
        scale: 0,
        system: "metric",
      },
      {
        conversion: 1 / 12,
        id: "in",
        label: "TERIOCK.MODELS.LengthUnit.UNITS.in.label",
        plural: "TERIOCK.MODELS.LengthUnit.UNITS.in.plural",
        scale: 0,
        system: "imperial",
      },
      {
        conversion: 1,
        id: "ft",
        label: "TERIOCK.MODELS.LengthUnit.UNITS.ft.label",
        plural: "TERIOCK.MODELS.LengthUnit.UNITS.ft.plural",
        scale: 1,
        symbol: "ft",
        system: "imperial",
      },
      {
        conversion: 5 / 2,
        id: "m",
        label: "TERIOCK.MODELS.LengthUnit.UNITS.m.label",
        plural: "TERIOCK.MODELS.LengthUnit.UNITS.m.plural",
        scale: 1,
        system: "metric",
      },
      {
        conversion: 5280,
        id: "mile",
        label: "TERIOCK.MODELS.LengthUnit.UNITS.mile.label",
        plural: "TERIOCK.MODELS.LengthUnit.UNITS.mile.plural",
        scale: 2,
        symbol: "mi",
        system: "imperial",
      },
      {
        conversion: 2500,
        id: "km",
        label: "TERIOCK.MODELS.LengthUnit.UNITS.km.label",
        plural: "TERIOCK.MODELS.LengthUnit.UNITS.km.plural",
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
