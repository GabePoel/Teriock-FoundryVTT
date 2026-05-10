import { TextField } from "../_module.mjs";

const { fields } = foundry.data;

/**
 * Initialize a non-persisted number.
 * @param {number} initial
 * @returns {NumberField}
 */
export function initialNumber(initial = 0) {
  return new fields.NumberField({ initial, persisted: false });
}

/**
 * Initialize a non-persisted boolean.
 * @param {boolean} initial
 * @returns {BooleanField}
 */
export function initialBoolean(initial = false) {
  return new fields.BooleanField({ initial });
}

/**
 * Initialize a non-persisted string.
 * @param {string} initial
 * @returns {StringField}
 */
export function initialString(initial = "") {
  return new fields.StringField({ initial, persisted: false });
}

/**
 * Initialize a non-persisted schema.
 * @param {object} schema
 * @returns {SchemaField}
 */
export function initialSchema(schema = {}) {
  return new fields.SchemaField(schema, { persisted: false });
}

/**
 * Initialize a non-persisted HTML text block.
 * @param {StringFieldOptions} [options]
 * @returns {TextField}
 */
export function initialText(options = {}) {
  return new TextField({ initial: "", persisted: false, ...options });
}

/**
 * Initialize a non-persisted bar.
 * @param {object} [options]
 * @param {number} [options.max]
 * @param {number} [options.min]
 * @param {number} [options.value]
 * @returns {SchemaField}
 */
export function initialBar(options = {}) {
  return initialSchema({
    max: initialNumber(options.max ?? 0),
    min: initialNumber(options.min ?? 0),
    value: initialNumber(options.value ?? 0),
  });
}
