import LengthUnitModel from "./length-unit-model.mjs";

export default class RangeModel extends LengthUnitModel {
  /**
   * @inheritDoc
   * @returns {Teriock.Units.UnitEntry[]}
   */
  static get zeroChoiceEntries() {
    return [{ id: "contact", label: "TERIOCK.MODELS.Range.UNITS.contact.label" }, {
      id: "melee",
      label: "TERIOCK.MODELS.Range.UNITS.melee.label",
    }, { id: "self", label: "TERIOCK.MODELS.Range.UNITS.self.label" }];
  }

  /** @inheritDoc */
  get icon() {
    return TERIOCK.display.icons.ability.range;
  }
}
