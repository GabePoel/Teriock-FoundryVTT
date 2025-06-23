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
 * @returns {foundry.data.fields.SchemaField} A schema field containing min, max, and current hack values
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
 * @param {Object} schema - The schema object to extend with hack fields
 * @returns {Object} The modified schema object with hack fields added
 * 
 * @example
 * ```javascript
 * const schema = {};
 * const hacksSchema = _defineHacks(schema);
 * // hacksSchema now contains: hacks field with all body part modifications
 * ```
 * 
 * @typedef {Object} HackField
 * @property {foundry.data.fields.NumberField} min - Minimum hack value for this body part (≥0, integer)
 * @property {foundry.data.fields.NumberField} max - Maximum hack value for this body part (≥0, integer)
 * @property {foundry.data.fields.NumberField} value - Current hack value for this body part (≥0, integer)
 * 
 * @typedef {Object} HacksSchema
 * @property {foundry.data.fields.SchemaField} hacks - Object containing all body part hack fields:
 *   - arm: {@link HackField} Arm hacks (max: 2)
 *   - leg: {@link HackField} Leg hacks (max: 2)
 *   - body: {@link HackField} Body hacks (max: 1)
 *   - eye: {@link HackField} Eye hacks (max: 1)
 *   - ear: {@link HackField} Ear hacks (max: 1)
 *   - mouth: {@link HackField} Mouth hacks (max: 1)
 *   - nose: {@link HackField} Nose hacks (max: 1)
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
