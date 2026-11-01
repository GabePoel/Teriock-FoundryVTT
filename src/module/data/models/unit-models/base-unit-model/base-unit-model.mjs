import { UnitUpdater } from "../../../../applications/dialogs/updaters/_module.mjs";
import { BaseRoll } from "../../../../dice/rolls/_module.mjs";
import { BaseDataModel } from "../../../abstract/_module.mjs";
import FormulaField from "../../../fields/formula-field/formula-field.mjs";

const { fields } = foundry.data;

/**
 * @import { FormSelectOption } from "@client/applications/forms/fields.mjs";
 */

/**
 * Model for a formula paired with a unit of measurement.
 */
export default class BaseUnitModel extends BaseDataModel {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.MODELS.BaseUnit"];

  /**
   * The unit new values start with.
   * @returns {string}
   */
  static get _initialUnit() {
    return this.choiceEntries[0].id;
  }

  /**
   * Whether the raw formula is deterministic.
   * @return {boolean}
   */
  static get _rawDeterministic() {
    return false;
  }

  /**
   * The placeholder for the raw formula.
   * @return {string}
   */
  static get _rawPlaceholder() {
    return "0";
  }

  /** @returns {Teriock.Units.UnitEntry[]} */
  static get choiceEntries() {
    return [...this.zeroChoiceEntries, ...this.finiteChoiceEntries, ...this.infiniteChoiceEntries];
  }

  /**
   * Valid unit choices.
   * @returns {Record<string, FormSelectOption>}
   */
  static get choices() {
    const groupLabels = this.groupLabels;
    const types = [["zero", this.zeroChoiceEntries], ["finite", this.finiteChoiceEntries], [
      "infinite",
      this.infiniteChoiceEntries,
    ]].filter(([_type, entries]) => entries.length);
    const choices = {};
    for (const [type, entries] of types) {
      const group = types.length > 1 ? _loc(groupLabels[type]) : undefined;
      for (const e of entries) { choices[e.id] = { group, label: _loc(e.label) }; }
    }
    return choices;
  }

  /** @returns {Teriock.Units.UnitEntry[]} */
  static get finiteChoiceEntries() {
    return [];
  }

  /**
   * Labels for the groups of unit choices of each type.
   * @returns {Record<"finite" | "infinite" | "zero", string>}
   */
  static get groupLabels() {
    return {
      finite: "TERIOCK.MODELS.BaseUnit.GROUPS.finite",
      infinite: "TERIOCK.MODELS.BaseUnit.GROUPS.infinite",
      zero: "TERIOCK.MODELS.BaseUnit.GROUPS.zero",
    };
  }

  /**
   * @inheritDoc
   * @returns {Teriock.Units.UnitEntry[]}
   */
  static get infiniteChoiceEntries() {
    return [{ id: "unlimited", label: _loc("TERIOCK.MODELS.BaseUnit.UNITS.unlimited") }];
  }

  /** @returns {Teriock.Units.UnitEntry[]} */
  static get zeroChoiceEntries() {
    return [];
  }

  /**
   * Get entries from a unit config.
   * @param {Record<string, Teriock.Config.UnitEntry>} config
   * @returns {Teriock.Units.UnitEntry[]}
   */
  static _getEntriesFromConfig(config) {
    return Object.entries(config).map(([id, { conversion, label, plural, scale, symbol, system }]) => ({
      conversion,
      id,
      label,
      plural,
      scale,
      symbol,
      system,
    }));
  }

  /** @inheritDoc */
  static defineSchema() {
    return {
      raw: new FormulaField({ deterministic: this._rawDeterministic, placeholder: this._rawPlaceholder }),
      unit: new fields.StringField({
        choices: this.choices,
        initial: this._initialUnit,
        nullable: false,
        required: true,
      }),
    };
  }

  /**
   * Get the source data for a value in the base unit. This uses the largest
   * finite unit that represents the given value as a whole number.
   * @param {number} value
   * @returns {{ raw: string, unit: string }}
   */
  static getSourceFromValue(value) {
    const entries = this.finiteChoiceEntries.toSorted((a, b) => (b.conversion || 1) - (a.conversion || 1));
    const base = entries.find(e => (e.conversion || 1) === 1) ?? entries.at(-1);
    if (value === 0) { return { raw: "0", unit: base.id }; }
    for (const { conversion = 1, id } of entries) {
      const count = value / conversion;
      if (Math.abs(count - Math.round(count)) < 1e-9) { return { raw: String(Math.round(count)), unit: id }; }
    }
    return { raw: String(value), unit: base.id };
  }

  /**
   * Convert to the base numerical unit.
   * @param {number} value
   * @returns {number}
   */
  #convert(value) {
    const unitType = this.unitType;
    if (unitType === "zero") { return 0; }
    if (unitType === "infinite") { return Infinity; }
    return value.toNearest(TERIOCK.CONST.UNIT_PRECISION);
  }

  /**
   * Derive the value of the formula.
   * @param {object} [rollData]
   * @returns {number}
   */
  #evaluate(rollData = {}) {
    return BaseRoll.minValue(this.formula, rollData);
  }

  /**
   * A text abbreviation of this.
   * @returns {string}
   */
  get abbreviation() {
    if (this.unitType === "finite") {
      return _loc("TERIOCK.MODELS.BaseUnit.FORMAT", { number: this.formula, unit: _loc(this.symbol) });
    }
    return this.label;
  }

  /**
   * The conversion factor for the chosen unit.
   * @returns {number}
   */
  get conversion() {
    const unitType = this.unitType;
    if (unitType === "zero") { return 0; }
    if (unitType === "infinite") { return Infinity; }
    return this.constructor.finiteChoiceEntries.find(e => e.id === this.unit).conversion || 1;
  }

  /**
   * The plain formula including unit conversion.
   * @returns {Teriock.System.FormulaString}
   */
  get formula() {
    const unitType = this.unitType;
    if (unitType === "zero") { return "0"; }
    if (unitType === "infinite") { return TERIOCK.CONST.INF.toString(); }

    const formula = this.raw || "0";
    const conversion = this.conversion;
    if (conversion === 1) { return formula; }
    return FormulaField.multiply(formula, conversion.toString());
  }

  /**
   * An icon for this unit model.
   * @returns {string}
   */
  get icon() {
    return "pen-to-square";
  }

  /**
   * Text that represents this unit value.
   * @returns {string}
   */
  get label() {
    if (this.unitType === "finite") {
      const entry = this.constructor.finiteChoiceEntries.find(e => e.id === this.unit);
      return `${this.raw || "0"} ${this.raw === "1" ? _loc(entry.label) : _loc(entry.plural)}`;
    }
    return this.constructor.choices[this.unit]?.label;
  }

  /**
   * Evaluated value that's safe to use in roll data.
   * @returns {number}
   */
  get rollValue() {
    return this.#convert(this.#evaluate());
  }

  /**
   * An abbreviation for the unit.
   * @returns {string}
   */
  get symbol() {
    return this.constructor.choiceEntries.find(e => e.id === this.unit).symbol || this.unit;
  }

  /**
   * The name of the chosen unit with appropriate pluralization applied.
   * @returns {string}
   */
  get unitName() {
    if (this.unitType !== "finite") { return this.label; }
    const entry = this.constructor.finiteChoiceEntries.find(e => e.id === this.unit);
    return _loc(this.unitValue === 1 ? entry.label : entry.plural);
  }

  /**
   * What type of unit this is.
   * @returns {"zero" | "finite" | "infinite"}
   */
  get unitType() {
    if (this.constructor.zeroChoiceEntries.some(e => e.id === this.unit)) { return "zero"; }
    else if (this.constructor.finiteChoiceEntries.some(e => e.id === this.unit)) { return "finite"; }
    return "infinite";
  }

  /**
   * Value derived from current roll data in chosen unit.
   * @returns {number}
   */
  get unitValue() {
    if (this.unitType !== "finite") { return this.value; }
    return this.convertTo(this.unit).toNearest(TERIOCK.CONST.UNIT_PRECISION);
  }

  /**
   * Value derived from current roll data in base unit.
   * @returns {number}
   */
  get value() {
    return this.#convert(this.#evaluate(this.getRollData()));
  }

  /**
   * Text abbreviation of evaluated value in the chosen unit.
   * @returns {string}
   */
  get valueAbbreviation() {
    if (this.unitType === "finite") {
      return _loc("TERIOCK.MODELS.BaseUnit.FORMAT", { number: this.unitValue, unit: _loc(this.symbol) });
    }
    return this.label;
  }

  /**
   * Convert the current value to a given unit.
   * @param {string} unit
   * @returns {number}
   */
  convertTo(unit) {
    const unitType = this.unitType;
    if (unitType !== "finite") { return this.value; }
    return this.value / (this.constructor.finiteChoiceEntries.find(e => e.id === unit)?.conversion || 1);
  }

  /**
   * Dialog to update this unit.
   * @returns {Promise<void>}
   */
  async updateDialog() {
    await UnitUpdater.create({ document: this.getNearestDocument(), path: this.schema.fieldPath, unitModel: this });
  }
}
