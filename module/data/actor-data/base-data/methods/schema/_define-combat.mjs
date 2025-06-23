const { fields } = foundry.data;

/**
 * Defines the combat schema for actor data including armor class, attack penalties, and piercing bonuses.
 *
 * Relevant wiki pages:
 * - [Armor Class](https://wiki.teriock.com/index.php/Core:Armor_Class)
 * - [Attack Penalty](https://wiki.teriock.com/index.php/Core:Attack_Penalty)
 * - [Style Bonus](https://wiki.teriock.com/index.php/Core:Style_Bonus)
 * - [AV0](https://wiki.teriock.com/index.php/Keyword:AV0)
 * - [UB](https://wiki.teriock.com/index.php/Keyword:UB)
 *
 * @param {Object} schema - The schema object to extend with combat fields
 * @returns {Object} The modified schema object with combat fields added
 *
 * @example
 * ```javascript
 * const schema = {};
 * const combatSchema = _defineCombat(schema);
 * // combatSchema now contains: wornAc, naturalAv, attackPenalty, sb, and piercing fields
 * ```
 *
 * @typedef {Object} CombatSchema
 * @property {foundry.data.fields.NumberField} wornAc - Worn Armor Class value (≥0, integer)
 * @property {foundry.data.fields.NumberField} naturalAv - Natural Armor Value (≥0, integer)
 * @property {foundry.data.fields.NumberField} attackPenalty - Attack penalty value (≤0, integer, step: 3)
 * @property {foundry.data.fields.BooleanField} sb - Whether the actor has a style bonus
 * @property {foundry.data.fields.StringField} piercing - Piercing ability type with choices:
 *   - "none": No piercing bonus
 *   - "av0": [AV0](https://wiki.teriock.com/index.php/Keyword:AV0)
 *   - "ub": [UB](https://wiki.teriock.com/index.php/Keyword:UB)
 */
export function _defineCombat(schema) {
  schema.wornAc = new fields.NumberField({
    initial: 0,
    integer: true,
    label: "Worn Armor Class",
    min: 0,
  });
  schema.naturalAv = new fields.NumberField({
    initial: 0,
    integer: true,
    label: "Natural Armor Value",
    min: 0,
  });
  schema.attackPenalty = new fields.NumberField({
    initial: 0,
    integer: true,
    label: "Attack Penalty",
    max: 0,
    step: 3,
  });
  schema.sb = new fields.BooleanField({
    initial: false,
    label: "Style Bonus",
  });
  schema.piercing = new fields.StringField({
    initial: "none",
    label: "Piercing",
    choices: {
      none: "None",
      av0: "AV0",
      ub: "UB",
    },
  });
  return schema;
}
