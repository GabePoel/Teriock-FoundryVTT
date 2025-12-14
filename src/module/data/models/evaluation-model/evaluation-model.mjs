import { TeriockRoll } from "../../../dice/_module.mjs";
import { roundTo } from "../../../helpers/utils.mjs";
import { FormulaField } from "../../fields/_module.mjs";
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
      decimals = undefined,
      ...options
    } = {},
  ) {
    super(data, { ...options });
    this._derivationOptions = { floor, ceil, min, max, blank, decimals };
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
  _value;

  /**
   * The latest evaluated value.
   * @returns {number}
   */
  get value() {
    if (typeof this._value === "number") {
      return this._value;
    } else {
      return this.#evaluate({ skipRollData: true });
    }
  }

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
  #evaluate(options = {}) {
    options = {
      ...this._derivationOptions,
      ...options,
    };
    const formula = this.formula;
    let value = TeriockRoll.quickValue(formula);
    if (formula.includes("@")) {
      if (options.skipRollData)
        value = TeriockRoll.quickValue(this._derivationOptions.blank);
      else value = TeriockRoll.minValue(this.formula, this.getRollData());
    }
    if (typeof options.max === "number") {
      value = Math.min(value, options.max);
    }
    if (typeof options.min === "number") {
      value = Math.max(value, options.min);
    }
    if (typeof options.decimals === "number") {
      value = roundTo(value, options.decimals);
    }
    if (options.floor) {
      value = Math.floor(value);
    }
    if (options.ceil) {
      value = Math.ceil(value);
    }
    return value;
  }

  /**
   * Derive value of formula.
   * @param {Teriock.Fields.FormulaDerivationOptions} [options]
   */
  evaluate(options = {}) {
    this._value = this.#evaluate(options);
  }
}
