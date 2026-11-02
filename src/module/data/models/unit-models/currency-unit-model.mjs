import { mergeMetadata } from "../../../utils/_module.mjs";
import BaseUnitModel from "./base-unit-model/base-unit-model.mjs";

export default class CurrencyUnitModel extends BaseUnitModel {
  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, { unitConfig: "currency", unlimited: false });

  /**
   * @inheritDoc
   * @returns {Teriock.Units.UnitEntry[]}
   */
  static get zeroChoiceEntries() {
    return [{ id: "none", label: "TERIOCK.MODELS.CurrencyUnit.UNITS.none.label" }];
  }

  /** @inheritdoc */
  static migrateNumberToUnit(value) {
    const coins = Object.entries(TERIOCK.CONFIG.currency)
      .filter(([_id, c]) => c.equipmentType === "coin")
      .sort(([_a, a], [_b, b]) => b.conversion - a.conversion);
    for (const [unit, { conversion }] of coins) {
      const count = (value / conversion).toNearest(TERIOCK.CONST.UNIT_PRECISION);
      if (Number.isInteger(count)) { return { raw: count, unit }; }
    }
    return super.migrateNumberToUnit(value);
  }

  /** @inheritDoc */
  get icon() {
    return TERIOCK.DISPLAY.icons.manifest.stat.gp;
  }
}
