import { evaluateSync } from "../../../helpers/utils.mjs";
import FormulaField from "./formula-field.mjs";

const { SchemaField, NumberField } = foundry.data.fields;

/**
 * Make modifiable formula fields.
 * @param {StringFieldOptions & Teriock.Fields._FormulaFieldOptions} options
 * @returns {SchemaField}
 */
export function modifiableFormula(options = {}) {
  /** @type {StringFieldOptions & Teriock.Fields._FormulaFieldOptions} */
  const defaultOptions = {
    deterministic: true,
    initial: "",
    nullable: false,
    required: false,
  };
  options = foundry.utils.mergeObject(defaultOptions, options);
  return new SchemaField({
    saved: new FormulaField(options),
    raw: new FormulaField(options),
  });
}

/**
 * Make modifiable number fields.
 * @param {NumberFieldOptions} options
 * @returns {SchemaField}
 */
export function modifiableNumber(options = {}) {
  /** @type {NumberFieldOptions} */
  const defaultOptions = {
    initial: 0,
    nullable: false,
    required: false,
  };
  options = foundry.utils.mergeObject(defaultOptions, options);
  return new SchemaField({
    saved: new NumberField(options),
    raw: new NumberField(options),
  });
}

/**
 * Base preparation for a modifiable field.
 * @param {Teriock.Fields.Modifiable<*, *>} field
 */
export function prepareModifiableBase(field) {
  field.raw = foundry.utils.deepClone(field.saved);
}

/**
 * Derived preparation for a numerical modifiable field.
 * @param {Teriock.Fields.ModifiableNumber} field
 * @param {object} [options]
 * @param {boolean} [options.floor]
 * @param {boolean} [options.ceil]
 * @param {number} [options.min]
 * @param {number} [options.max]
 */
export function deriveModifiableNumber(field, options = {}) {
  let rawValue = foundry.utils.deepClone(field.raw);
  rawValue = clamp(rawValue, options);
  field.value = rawValue;
}

/**
 * Derived preparation for a deterministic modifiable field.
 * @param {Teriock.Fields.ModifiableDeterministic} field
 * @param {TeriockCommon} doc
 * @param {object} [options]
 * @param {boolean} [options.floor]
 * @param {boolean} [options.ceil]
 * @param {number} [options.min]
 * @param {number} [options.max]
 * @param {number} [options.blank]
 */
export function deriveModifiableDeterministic(field, doc, options = {}) {
  const defaultOptions = {
    floor: true,
    min: 0,
    blank: 0,
  };
  options = foundry.utils.mergeObject(defaultOptions, options);
  let rawValue;
  if (typeof options.blank === "number" && !field.raw) {
    rawValue = options.blank;
  } else {
    rawValue = evaluateSync(field.raw, doc?.getRollData() || {});
  }
  rawValue = clamp(rawValue, options);
  field.value = rawValue;
}

/**
 * Derived preparation for indeterministic modifiable field.
 * @param {Teriock.Fields.ModifiableIndeterministic} field
 */
export function deriveModifiableIndeterministic(field) {
  field.value = foundry.utils.deepClone(field.raw);
}

/**
 * @param value
 * @param options
 * @param {object} options
 * @param {boolean} options.[floor]
 * @param {boolean} options.[ceil]
 * @param {number} options.[min]
 * @param {number} options.[max]
 */
function clamp(value, options) {
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
