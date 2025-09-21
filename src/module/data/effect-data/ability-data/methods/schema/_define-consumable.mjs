const { fields } = foundry.data;

/**
 * Defines the consumable fields for Teriock ability data schema.
 *
 * @param {object} schema - The base schema object to extend.
 * @returns {object} Schema object with consumable fields added.
 * @private
 *
 * @example
 * // Add consumable fields to a schema.
 * const schema = _defineConsumable(schema);
 */
export function _defineConsumable(schema) {
  schema.consumable = new fields.BooleanField({
    initial: false,
    label: "Consumable",
  });
  return schema;
}
