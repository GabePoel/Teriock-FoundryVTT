const { fields } = foundry.data;

/**
 * Field for card displays.
 * @param {Teriock.Parameters.Shared.CardDisplaySize} size
 * @param {boolean} gapless
 * @returns {SchemaField}
 */
function displayField(size = "medium", gapless = false) {
  return new fields.SchemaField({
    gapless: new fields.BooleanField({ initial: gapless }),
    size: new fields.StringField({ initial: size }),
  });
}

/**
 * Defines the schema for sheet components.
 * @param {object} schema
 * @returns {object}
 * @private
 */
export function _defineSheet(schema) {
  schema.sheet = new fields.SchemaField({
    display: new fields.SchemaField({
      ability: displayField("small", true),
      consequence: displayField("small", true),
      equipment: displayField("small", true),
      fluency: displayField(),
      power: displayField(),
      rank: displayField(),
      resource: displayField(),
    }),
    notes: new fields.HTMLField({ initial: "Notes can be added here." }),
  });
  return schema;
}
