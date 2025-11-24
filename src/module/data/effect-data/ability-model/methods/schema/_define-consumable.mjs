const { fields } = foundry.data;

/**
 * Defines the consumable fields for ability data schema.
 * @param {object} schema
 * @returns {object}
 * @private
 */
export function _defineConsumable(schema) {
  schema.consumable = new fields.BooleanField({
    initial: false,
    label: "Consumable",
  });
  return schema;
}
