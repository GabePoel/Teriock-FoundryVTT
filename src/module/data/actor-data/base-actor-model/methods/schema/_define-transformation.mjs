const { fields } = foundry.data;

/**
 * Transformation schema.
 * @param {object} schema
 * @returns {object}
 * @private
 */
export function _defineTransformation(schema) {
  schema.transformation = new fields.SchemaField({
    primary: new fields.DocumentIdField({
      nullable: true,
      initial: null,
    }),
  });
  return schema;
}
