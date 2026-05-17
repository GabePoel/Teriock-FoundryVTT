import { BaseRoll } from "../../dice/rolls/_module.mjs";
import { FormulaField } from "../fields/_module.mjs";
import EmbeddedDataModel from "./embedded-data-model.mjs";

/**
 * Model that improves functionality and ergonomics of formula fields.
 * @property {Teriock.System.FormulaString} raw - String corresponding to the formula.
 */
export default class EvaluationModel extends EmbeddedDataModel {
  /**
   * @inheritDoc
   * @param {StringFieldOptions & Teriock.Fields._FormulaFieldOptions} [options]
   * @returns {{raw: FormulaField}}
   */
  static defineSchema(options = {}) {
    return { raw: new FormulaField(options) };
  }

  constructor(
    data = {},
    { blank = 0, ceil = false, floor = true, interval = undefined, max = Infinity, min = 0, ...options } = {},
  ) {
    super(data, { ...options });
    this._derivationOptions = { blank, ceil, floor, interval, max, min };
  }

  /**
   * Derive the value of the formula internally.
   * @param {Partial<Teriock.Options.EvaluationOptions>} [options]
   * @returns {number}
   */
  #evaluate(options = {}) {
    options = {
      ...this._derivationOptions,
      ...options,
    };
    const formula = this.formula;
    let needsEval = false;
    let value;
    if (formula.includes("Infinity")) {
      value = Infinity;
    } else if (!isNaN(Number(formula))) {
      value = Number(formula);
    } else {
      needsEval = true;
    }
    if (needsEval) {
      let rollData = options.rollData ?? {};
      if (needsEval && !options.skipRollData) {
        rollData = this.getRollData();
      }
      value = BaseRoll.minValue(formula, rollData);
    }
    if (typeof options.max === "number") {
      value = Math.min(value, options.max);
    }
    if (typeof options.min === "number") {
      value = Math.max(value, options.min);
    }
    if (typeof options.interval === "number") {
      value = value.toNearest(options.interval);
    }
    if (options.floor) {
      value = Math.floor(value);
    }
    if (options.ceil) {
      value = Math.ceil(value);
    }
    return value;
  }

  /** @type {Teriock.Fields.FormulaDerivationOptions} */
  _derivationOptions;

  /** @type {number} */
  _value;

  /**
   * Value as derived from current roll data.
   * @returns {number}
   */
  get currentValue() {
    return this.#evaluate();
  }

  /**
   * The formula that gets evaluated.
   * @returns {Teriock.System.FormulaString}
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
   * If this has a non-zero value. This does not handle `@` values very well.
   * @returns {boolean}
   */
  get nonZero() {
    return BaseRoll.minValue(this.formula) !== 0 && BaseRoll.maxValue(this.formula) !== 0;
  }

  /**
   * Text that represents this formula.
   * @returns {string}
   */
  get text() {
    return this.nonZero ? this.formula : "";
  }

  /**
   * The latest evaluated value.
   * @returns {number}
   */
  get value() {
    if (typeof this._value === "number") {
      return this._value;
    }
    return this.#evaluate({ skipRollData: true });
  }

  /**
   * Derive value of formula.
   * @param {Partial<Teriock.Options.EvaluationOptions>} [options]
   */
  evaluate(options = {}) {
    this._value = this.#evaluate(options);
  }
}
