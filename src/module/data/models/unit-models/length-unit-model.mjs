import FormulaField from "../../fields/formula-field/formula-field.mjs";
import BaseUnitModel from "./base-unit-model/base-unit-model.mjs";

/** @type {Record<string, { factor: number, unit: string }>} */
const METRIC_MIGRATIONS = {
  cm: { factor: 0.03281 * 12, unit: "in" },
  km: { factor: 3281 / 5280, unit: "mile" },
  m: { factor: 3.281, unit: "ft" },
};

export default class LengthUnitModel extends BaseUnitModel {
  /**
   * @inheritDoc
   * @returns {Teriock.Units.UnitEntry[]}
   */
  static get finiteChoiceEntries() {
    return this._getEntriesFromConfig(TERIOCK.CONFIG.length);
  }

  /** @inheritDoc */
  static migrateData(source, options) {
    const migration = METRIC_MIGRATIONS[source.unit];
    if (migration) {
      source.raw = FormulaField.multiply(source.raw || "0", String(migration.factor.toNearest(0.0001)));
      source.unit = migration.unit;
    }
    return super.migrateData(source, options);
  }

  /** @inheritDoc */
  get icon() {
    return TERIOCK.DISPLAY.icons.manifest.ability.range;
  }
}
