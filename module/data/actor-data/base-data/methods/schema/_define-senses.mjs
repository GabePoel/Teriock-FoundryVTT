const { fields } = foundry.data;

function senseField(initial, name) {
  return new fields.NumberField({
    initial: initial,
    integer: true,
    min: 0,
    label: `${name} Range`,
  });
}

/**
 * Defines the senses schema for an actor by adding various sense fields.
 *
 * @param {Object} schema - The schema object to extend with senses.
 * @returns {Object} The updated schema object with the senses field added.
 */
export function _defineSenses(schema) {
  schema.senses = new fields.SchemaField({
    night: senseField(0, "Night Vision"),
    dark: senseField(0, "Dark Vision"),
    ethereal: senseField(0, "Ethereal Vision"),
    blind: senseField(0, "Blind Fighting"),
    truth: senseField(0, "True Sight"),
    smell: senseField(0, "Advanced Smell"),
    hearing: senseField(0, "Advanced Hearing"),
    sight: senseField(0, "Advanced Sight"),
    invisible: senseField(0, "See Invisible"),
  });
  return schema;
}
