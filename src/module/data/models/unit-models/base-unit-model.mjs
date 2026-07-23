import { UnitUpdater } from "../../../applications/dialogs/updaters/_module.mjs";
import { BaseRoll } from "../../../dice/rolls/_module.mjs";
import { multiplyFormula } from "../../../helpers/formula.mjs";
import { BaseDataModel } from "../../abstract/_module.mjs";
import FormulaField from "../../fields/formula-field.mjs";

const { fields } = foundry.data;

/**
 * Model for a formula paired with a unit of measurement.
 * @property {Teriock.System.FormulaString} raw
 * @property {string} unit
 */
export default class BaseUnitModel extends BaseDataModel {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.MODELS.BaseUnit"];

  /** @returns {Teriock.Units.UnitEntry[]} */
  static get choiceEntries() {
    return [...this.zeroChoiceEntries, ...this.finiteChoiceEntries, ...this.infiniteChoiceEntries];
  }

  /**
   * Valid unit choices.
   * @returns {Record<string, string>}
   */
  static get choices() {
    return Object.fromEntries(this.choiceEntries.map(e => [e.id, _loc(e.label)]));
  }

  /** @returns {Teriock.Units.UnitEntry[]} */
  static get finiteChoiceEntries() {
    return [];
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

  /** @inheritDoc */
  static defineSchema() {
    return {
      raw: new FormulaField(),
      unit: new fields.StringField({
        choices: this.choices,
        initial: this.choiceEntries[0].id,
        nullable: false,
        required: true,
      }),
    };
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
    return value.toNearest(TERIOCK.config.system.unitPrecision);
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
    if (this.unitType === "finite") { return `${this.formula} ${this.symbol}`; }
    return this.text;
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
    if (unitType === "infinite") { return TERIOCK.config.system.inf.toString(); }

    const formula = this.raw || "0";
    const conversion = this.conversion;
    if (conversion === 1) { return formula; }
    return multiplyFormula(formula, conversion.toString());
  }

  /**
   * An icon for this unit model.
   * @returns {string}
   */
  get icon() {
    return "pen-to-square";
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
   * Text that represents this unit value.
   * @returns {string}
   */
  get text() {
    if (this.unitType === "finite") {
      const entry = this.constructor.finiteChoiceEntries.find(e => e.id === this.unit);
      return `${this.raw} ${this.raw === "1" ? _loc(entry.label) : _loc(entry.plural)}`;
    }
    return this.constructor.choices[this.unit];
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
   * Value as derived from current roll data.
   * @returns {number}
   */
  get value() {
    return this.#convert(this.#evaluate(this.getRollData()));
  }

  /**
   * Convert the current value to a given unit.
   * @param {string} unit
   * @returns {number}
   */
  convertTo(unit) {
    const unitType = this.unitType;
    if (unitType !== "finite") { return this.value; }
    return (this.constructor.finiteChoiceEntries.find(e => e.id === unit).conversion || 1) * this.value;
  }

  /**
   * Dialog to update this unit.
   * @returns {Promise<void>}
   */
  async updateDialog() {
    await UnitUpdater.create({ document: this.document, path: this.schema.fieldPath, unitModel: this });
  }
}
