import { modifiableFormula } from "../../../../shared/fields/modifiable.mjs";

const { fields } = foundry.data;

/**
 * Defines the magic schema.
 * @param {object} schema
 * @returns {object}
 * @private
 */
export function _defineMagic(schema) {
  schema.magic = new fields.SchemaField({
    maxRotators: modifiableFormula({
      deterministic: true,
    }),
  });
  return schema;
}
