import LengthUnitModel from "./length-unit-model.mjs";

export default class RangeModel extends LengthUnitModel {
  /**
   * @inheritDoc
   * @returns {Teriock.Units.UnitEntry[]}
   */
  static get zeroChoiceEntries() {
    return [
      {
        id: "self",
        label: "TERIOCK.MODELS.Range.UNITS.self.label",
      },
      {
        id: "melee",
        label: "TERIOCK.MODELS.Range.UNITS.melee.label",
      },
    ];
  }

  /** @inheritDoc */
  get icon() {
    return "ruler";
  }
}
