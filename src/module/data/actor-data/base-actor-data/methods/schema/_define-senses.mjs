const { fields } = foundry.data;

/**
 * Creates a number field for a specific sense.
 *
 * @param {number} initial
 * @param {string} name
 * @returns {NumberField}
 */
function senseField(initial, name) {
  return new fields.NumberField({
    initial: initial,
    integer: true,
    label: `${name} Range`,
    min: 0,
  });
}

/**
 * Defines the senses schema for an actor by adding various sense fields.
 * @param {object} schema - The schema object to extend with senses.
 * @returns {object} The updated schema object with the senses field added.
 */
export function _defineSenses(schema) {
  schema.senses = new fields.SchemaField({
    blind: senseField(0, "Blind Fighting"),
    dark: senseField(0, "Dark Vision"),
    ethereal: senseField(0, "Ethereal Vision"),
    hearing: senseField(0, "Advanced Hearing"),
    invisible: senseField(0, "See Invisible"),
    night: senseField(0, "Night Vision"),
    sight: senseField(0, "Advanced Sight"),
    smell: senseField(0, "Advanced Smell"),
    truth: senseField(0, "True Sight"),
  });
  return schema;
}
