const { fields } = foundry.data;

/**
 * Creates a schema field definition for an attribute with save proficiency and bonus values.
 *
 * @param {string} name - The name of the attribute (e.g., "STR", "INT", "MOV")
 * @returns {SchemaField} A schema field containing:
 *   - saveProficient: Boolean indicating if proficient in saves for this attribute
 *   - saveFluent: Boolean indicating if fluent in saves for this attribute
 *   - value: Number representing the save bonus for this attribute
 */
function attributeField(name) {
  return new fields.SchemaField({
    saveFluent: new fields.BooleanField({
      initial: false,
      label: `Fluent in ${name} Saves`,
    }),
    saveProficient: new fields.BooleanField({
      initial: false,
      label: `Proficient in ${name} Saves`,
    }),
    value: new fields.NumberField({
      initial: -3,
      integer: true,
      label: `${name} Save Bonus`,
    }),
  });
}

/**
 * Defines the basic schema fields for actor data including level, size, and attributes.
 *
 * Relevant wiki pages:
 * - [Leveling Up](https://wiki.teriock.com/index.php/Core:Leveling_Up)
 * - [Size](https://wiki.teriock.com/index.php/Core:Size)
 * - [Attributes](https://wiki.teriock.com/index.php/Core:Attributes)
 *
 * @param {object} schema - The schema object to extend with basic actor fields
 * @returns {object} The modified schema object with basic actor fields added
 */
export function _defineAttributes(schema) {
  schema.lvl = new fields.NumberField({
    initial: 1,
    integer: true,
    label: "Level",
    min: 1,
  });
  schema.size = new fields.NumberField({
    initial: 3,
    label: "Size",
    max: 30,
    min: 0,
  });
  schema.attributes = new fields.SchemaField({
    int: attributeField("INT"),
    mov: attributeField("MOV"),
    per: attributeField("PER"),
    snk: attributeField("SNK"),
    str: attributeField("STR"),
    unp: attributeField("UNP"),
  });
  schema.updateCounter = new fields.BooleanField({
    initial: false,
    label: "Update Counter",
  });
  schema.abilityFlags = new fields.TypedObjectField(new fields.StringField());
  return schema;
}
