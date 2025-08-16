const { fields } = foundry.data;

/**
 * Orderings schema.
 *
 * @param {object} schema
 * @private
 */
export function _defineOrderings(schema) {
  schema.orderings = new fields.SchemaField({
    ranks: new fields.ArrayField(new fields.DocumentIdField()),
    species: new fields.ArrayField(new fields.DocumentIdField()),
  });
  return schema;
}
