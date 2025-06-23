const { fields } = foundry.data;

/**
 * Defines the damage schema for actor data including various damage types.
 *
 * Relevant wiki pages:
 * - [Damage](https://wiki.teriock.com/index.php/Core:Damage)
 * - [Martial Arts](https://wiki.teriock.com/index.php/Ability:Martial_Arts)
 * - [Hind Claws](https://wiki.teriock.com/index.php/Ability:Hind_Claws)
 * - [Bite](https://wiki.teriock.com/index.php/Ability:Bite)
 * - [Shield Bash](https://wiki.teriock.com/index.php/Ability:Shield_Bash)
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
 * @property {foundry.data.fields.StringField} standard - Standard damage dice/expression
 * @property {foundry.data.fields.StringField} hand - Hand-to-hand damage dice/expression
 * @property {foundry.data.fields.StringField} foot - Foot/kicking damage dice/expression
 * @property {foundry.data.fields.StringField} mouth - Biting damage dice/expression
 * @property {foundry.data.fields.StringField} bucklerShield - Buckler shield bash damage dice/expression
 * @property {foundry.data.fields.StringField} largeShield - Large shield bash damage dice/expression
 * @property {foundry.data.fields.StringField} towerShield - Tower shield bash damage dice/expression
 *
 * @typedef {Object} DamageSchema
 * @property {foundry.data.fields.SchemaField} damage - {@link DamageField} Object containing all damage types
 */
export function _defineDamage(schema) {
  schema.damage = new fields.SchemaField({
    standard: new fields.StringField({
      initial: "",
      label: "Standard Damage",
    }),
    hand: new fields.StringField({
      initial: "1",
      label: "Hand Damage",
    }),
    foot: new fields.StringField({
      initial: "1",
      label: "Foot Damage",
    }),
    mouth: new fields.StringField({
      initial: "1",
      label: "Mouth Damage",
    }),
    bucklerShield: new fields.StringField({
      initial: "1",
      label: "Buckler Shield Damage",
    }),
    largeShield: new fields.StringField({
      initial: "1",
      label: "Large Shield Damage",
    }),
    towerShield: new fields.StringField({
      initial: "1",
      label: "Tower Shield Damage",
    }),
  });
  return schema;
}
