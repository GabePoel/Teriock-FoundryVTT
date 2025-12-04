import TeriockRoll from "../../../dice/roll.mjs";
import { FormulaField } from "../../shared/fields/_module.mjs";
import EmbeddedDataModel from "../embedded-data-model/embedded-data-model.mjs";

/**
 * Model that improves functionality and ergonomics of formula fields.
 * @property {string} raw - String corresponding to the formula.
 */
export default class EvaluationModel extends EmbeddedDataModel {
  constructor(
    data = {},
    {
      floor = true,
      ceil = false,
      min = 0,
      max = Infinity,
      blank = 0,
      ...options
    } = {},
  ) {
    super(data, { ...options });
    this._derivationOptions = { floor, ceil, min, max, blank };
  }

  /**
   * @inheritDoc
   * @param {StringFieldOptions & Teriock.Fields._FormulaFieldOptions} [options]
   * @returns {{raw: FormulaField}}
   */
  static defineSchema(options = {}) {
    return {
      raw: new FormulaField(options),
    };
  }

  /** @inheritDoc */
  static migrateData(data) {
    if (typeof data.saved === "string") {
      data.raw = data.saved;
      delete data.saved;
    }
    return super.migrateData(data);
  }

  /** @type {Teriock.Fields.FormulaDerivationOptions} */
  _derivationOptions;

  /** @type {number} */
  value;

  /**
   * Value as derived from current roll data.
   * @returns {number}
   */
  get currentValue() {
    return this.#evaluate();
  }

  /**
   * The formula that gets evaluated.
   * @returns {string}
   */
  get formula() {
    if (this.raw) {
      return this.raw;
    }
    if (["number", "string"].includes(typeof this._derivationOptions.blank)) {
      return `${this._derivationOptions.blank}`;
    }
    return "0";
  }

  /**
   * If this has a non-zero value.
   * @returns {boolean}
   */
  get nonZero() {
    return (
      TeriockRoll.minValue(this.formula) !== 0 &&
      TeriockRoll.maxValue(this.formula) !== 0
    );
  }

  /**
   * Text that represents this formula.
   * @returns {string}
   */
  get text() {
    return this.nonZero ? this.formula : "";
  }

  /**
   * Derive value of formula internally.
   * @param {Teriock.Fields.FormulaDerivationOptions} [options]
   * @returns {number}
   */
  #evaluate(options = this._derivationOptions) {
    if (this.formula.includes("Infinity")) {
      return Infinity;
    }
    let value = TeriockRoll.meanValue(this.formula, this.getRollData());
    if (options.floor) {
      value = Math.floor(value);
    }
    if (options.ceil) {
      value = Math.ceil(value);
    }
    if (typeof options.max === "number") {
      value = Math.min(value, options.max);
    }
    if (typeof options.min === "number") {
      value = Math.max(value, options.min);
    }
    return value;
  }

  /**
   * Derive value of formula.
   * @param {Teriock.Fields.FormulaDerivationOptions} [options]
   */
  evaluate(options = this._derivationOptions) {
    this.value = this.#evaluate(options);
  }
}
