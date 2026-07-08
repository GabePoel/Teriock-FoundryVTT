import { UnitUpdater } from "../../../applications/dialogs/updaters/_module.mjs";
import { multiplyFormula } from "../../../helpers/formula.mjs";
import { EvaluationModel } from "../../abstract/_module.mjs";

const { fields } = foundry.data;

/**
 * @property {string} unit
 */
export default class BaseUnitModel extends EvaluationModel {
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
    return Object.assign(super.defineSchema(), {
      unit: new fields.StringField({
        choices: this.choices,
        initial: this.choiceEntries[0].id,
        nullable: false,
        required: true,
      }),
    });
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
    return value.toNearest(0.01);
  }

  /** @inheritDoc */
  get _formPaths() {
    return ["unit", "raw"];
  }

  /**
   * Title for update window.
   * @returns {string}
   */
  get _updateTitle() {
    return _loc("TERIOCK.MODELS.BaseUnit.UPDATE.basic", { label: this.schema.label });
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

  /** @inheritDoc */
  get currentValue() {
    return this.#convert(super.currentValue);
  }

  /** @inheritDoc */
  get formula() {
    const unitType = this.unitType;
    if (unitType === "zero") { return "0"; }
    if (unitType === "infinite") { return "9".repeat(32); }

    const conversion = this.conversion;
    if (conversion === 1) { return super.formula; }
    return multiplyFormula(super.formula, conversion.toString());
  }

  /**
   * An icon for this unit model.
   * @returns {string}
   */
  get icon() {
    return "pen-to-square";
  }

  /**
   * An abbreviation for the unit.
   * @returns {string}
   */
  get symbol() {
    return this.constructor.choiceEntries.find(e => e.id === this.unit).symbol || this.unit;
  }

  /** @inheritDoc */
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

  /** @inheritDoc */
  get value() {
    return this.#convert(super.value);
  }

  /**
   * Convert the current to a given unit.
   * @param {string} unit
   * @returns {number}
   */
  convertTo(unit) {
    const unitType = this.unitType;
    if (unitType !== "finite") { return this.currentValue; }
    return (this.constructor.finiteChoiceEntries.find(e => e.id === unit).conversion || 1) * this.currentValue;
  }

  /**
   * Dialog to update this unit.
   * @returns {Promise<void>}
   */
  async updateDialog() {
    await UnitUpdater.create({ document: this.document, path: this.schema.fieldPath, unitModel: this });
  }
}
