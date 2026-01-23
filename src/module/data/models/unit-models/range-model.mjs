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
        label: "Self",
      },
      {
        id: "melee",
        label: "Melee",
      },
    ];
  }

  /** @inheritDoc */
  get icon() {
    return "ruler";
  }
}
