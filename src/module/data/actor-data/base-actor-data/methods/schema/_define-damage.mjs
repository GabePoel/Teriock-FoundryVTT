const { fields } = foundry.data;

/**
 * Defines the damage schema for actor data including various damage types.
 *
 * Relevant wiki pages:
 * - [Damage](https://wiki.teriock.com/index.php/Core:Damage)
 *
 * @example
 * ```js
 * const schema = {};
 * const damageSchema = _defineDamage(schema);
 * // damageSchema now contains: damage field with various damage types
 * ```
 *
 * @param {Object} schema - The schema object to extend with damage fields
 * @returns {Object} The modified schema object with damage fields added
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
