const { fields } = foundry.data;

/**
 * Defines the damage schema for actor data including various damage types.
 *
 * Relevant wiki pages:
 * - [Damage](https://wiki.teriock.com/index.php/Core:Damage)
 *
 * @param {Object} schema - The schema object to extend with damage fields
 * @returns {Object} The modified schema object with damage fields added
 *
 * @example
 * ```javascript
 * const schema = {};
 * const damageSchema = _defineDamage(schema);
 * // damageSchema now contains: damage field with various damage types
 * ```
 *
 * @typedef {Object} DamageField
 * @property {StringField} standard - Standard damage dice/expression
 *
 * @typedef {Object} DamageSchema
 * @property {SchemaField} damage - {@link DamageField} Object containing all damage types
 */
export function _defineDamage(schema) {
  schema.damage = new fields.SchemaField({
    standard: new fields.StringField({
      initial: "",
      label: "Standard Damage",
    }),
  });
  return schema;
}
