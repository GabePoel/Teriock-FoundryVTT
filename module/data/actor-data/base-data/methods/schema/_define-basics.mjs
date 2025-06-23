const { fields } = foundry.data;

/**
 * Creates a schema field definition for an attribute with save proficiency and bonus values.
 * 
 * @param {string} name - The name of the attribute (e.g., "STR", "INT", "MOV")
 * @returns {foundry.data.fields.SchemaField} A schema field containing:
 *   - saveProficient: Boolean indicating if proficient in saves for this attribute
 *   - saveFluent: Boolean indicating if fluent in saves for this attribute  
 *   - value: Number representing the save bonus for this attribute
 */
function attributeField(name) {
  return new fields.SchemaField({
    saveProficient: new fields.BooleanField({
      initial: false,
      label: `Proficient in ${name} Saves`,
    }),
    saveFluent: new fields.BooleanField({
      initial: false,
      label: `Fluent in ${name} Saves`,
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
 * @param {Object} schema - The schema object to extend with basic actor fields
 * @returns {Object} The modified schema object with basic actor fields added
 * 
 * @example
 * ```javascript
 * const schema = {};
 * const basicSchema = _defineBasics(schema);
 * // basicSchema now contains: lvl, size, and attributes fields
 * ```
 * 
 * @typedef {Object} AttributeField
 * @property {foundry.data.fields.BooleanField} saveProficient - Whether proficient in saves for this attribute
 * @property {foundry.data.fields.BooleanField} saveFluent - Whether fluent in saves for this attribute
 * @property {foundry.data.fields.NumberField} value - Save bonus value for this attribute
 * 
 * @typedef {Object} BasicActorSchema
 * @property {foundry.data.fields.NumberField} lvl - Actor level (1-∞, integer)
 * @property {foundry.data.fields.NumberField} size - Actor size rating (0-30)
 * @property {foundry.data.fields.SchemaField} attributes - Object containing six attribute fields:
 *   - int: {@link AttributeField} Intelligence attribute
 *   - mov: {@link AttributeField} Movement attribute  
 *   - per: {@link AttributeField} Perception attribute
 *   - snk: {@link AttributeField} Sneak attribute
 *   - str: {@link AttributeField} Strength attribute
 *   - unp: {@link AttributeField} Unpredictability attribute
 */
export function _defineBasics(schema) {
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
  return schema;
}
