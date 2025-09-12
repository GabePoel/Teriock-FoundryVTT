const { fields } = foundry.data;

/**
 * Creates a hack field definition with min, max, and current values for how much hack damage
 * can be taken from a body part.
 *
 * Relevant wiki pages:
 * - [Hacks](https://wiki.teriock.com/index.php/Damage:Hack)
 *
 * @param {number} max - The maximum number of hacks allowed for this body part
 * @param {string} name - The name of the body part (e.g., "Arm", "Leg", "Body")
 * @returns {SchemaField} A schema field containing min, max, and current hack values
 */
function hackField(max, name) {
  return new fields.SchemaField({
    min: new fields.NumberField({
      initial: 0,
      integer: true,
      label: `Minimum ${name} Hack`,
    }),
    max: new fields.NumberField({
      initial: max,
      integer: true,
      label: `Maximum ${name} Hack`,
    }),
    value: new fields.NumberField({
      initial: 0,
      integer: true,
      label: `Current ${name} Hack`,
    }),
  });
}

/**
 * Defines all the hack fields for the actor data.
 *
 * Relevant wiki pages:
 * - [Hacks](https://wiki.teriock.com/index.php/Damage:Hack)
 *
 * @example
 * ```js
 * const schema = {};
 * const hacksSchema = _defineHacks(schema);
 * // hacksSchema now contains: `hacks` field with all body part modifications
 * ```
 *
 * @param {object} schema - The schema object to extend with hack fields
 * @returns {object} The modified schema object with hack fields added
 */
export function _defineHacks(schema) {
  schema.hacks = new fields.SchemaField({
    arm: hackField(2, "Arm"),
    leg: hackField(2, "Leg"),
    body: hackField(1, "Body"),
    eye: hackField(1, "Eye"),
    ear: hackField(1, "Ear"),
    mouth: hackField(1, "Mouth"),
    nose: hackField(1, "Nose"),
  });
  return schema;
}
