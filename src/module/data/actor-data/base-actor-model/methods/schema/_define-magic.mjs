import { EvaluationField } from "../../../../fields/_module.mjs";

const { fields } = foundry.data;

/**
 * Defines the magic schema.
 * @param {object} schema
 * @returns {object}
 * @private
 */
export function _defineMagic(schema) {
  schema.magic = new fields.SchemaField({
    maxRotators: new EvaluationField({
      floor: true,
    }),
  });
  return schema;
}
