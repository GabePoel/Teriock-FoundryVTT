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
    return [{
      conversion: 1 / 12,
      id: "in",
      label: "TERIOCK.MODELS.LengthUnit.UNITS.in.label",
      plural: "TERIOCK.MODELS.LengthUnit.UNITS.in.plural",
      scale: 0,
      system: "imperial",
    }, {
      conversion: 1,
      id: "ft",
      label: "TERIOCK.MODELS.LengthUnit.UNITS.ft.label",
      plural: "TERIOCK.MODELS.LengthUnit.UNITS.ft.plural",
      scale: 1,
      symbol: "TERIOCK.MODELS.LengthUnit.UNITS.ft.symbol",
      system: "imperial",
    }, {
      conversion: 5280,
      id: "mile",
      label: "TERIOCK.MODELS.LengthUnit.UNITS.mile.label",
      plural: "TERIOCK.MODELS.LengthUnit.UNITS.mile.plural",
      scale: 2,
      symbol: "mi",
      system: "imperial",
    }];
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
