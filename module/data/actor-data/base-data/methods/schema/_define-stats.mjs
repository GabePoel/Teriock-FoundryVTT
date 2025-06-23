const { fields } = foundry.data;

/**
 * Creates a stat field definition with min, max, and current values, plus optional base and temp fields.
 * 
 * @param {string} name - The name of the stat (e.g., "HP", "MP", "Wither")
 * @param {Object} options - Configuration options for the stat field
 * @param {number} [options.min=0] - Initial minimum value for the stat
 * @param {number} [options.max=1] - Initial maximum value for the stat
 * @param {number} [options.value=1] - Initial current value for the stat
 * @param {boolean} [options.base=false] - Whether to include a base value field
 * @param {boolean} [options.temp=false] - Whether to include a temporary value field
 * @returns {foundry.data.fields.SchemaField} A schema field containing the stat's value fields
 */
function statField(name, options = {}) {
  const schema = {
    min: new fields.NumberField({
      initial: options.min || 0,
      integer: true,
      label: `Minimum ${name}`,
    }),
    max: new fields.NumberField({
      initial: options.max || 1,
      integer: true,
      label: `Maximum ${name}`,
    }),
    value: new fields.NumberField({
      initial: options.value || 1,
      integer: true,
      label: `Current ${name}`,
    }),
  };
  if (options.base) {
    schema.base = new fields.NumberField({
      initial: 1,
      integer: true,
      label: `Base ${name}`,
    });
  }
  if (options.temp) {
    schema.temp = new fields.NumberField({
      initial: 0,
      integer: true,
      label: `Temporary ${name}`,
    });
  }
  return new fields.SchemaField(schema);
}

/**
 * Defines the core stats schema for actor data including health, mana, wither, and presence.
 * 
 * Relevant wiki pages:
 * - [Hit Points and Mana Points](https://wiki.teriock.com/index.php/Core:Hit_Points_and_Mana_Points)
 * - [Wither](https://wiki.teriock.com/index.php/Drain:Wither)
 * - [Presence](https://wiki.teriock.com/index.php/Core:Presence)
 * 
 * @param {Object} schema - The schema object to extend with stat fields
 * @returns {Object} The modified schema object with stat fields added
 * 
 * @example
 * ```javascript
 * const schema = {};
 * const statsSchema = _defineStats(schema);
 * // statsSchema now contains: hp, mp, wither, and presence fields
 * ```
 * 
 * @typedef {Object} StatField
 * @property {foundry.data.fields.NumberField} min - Minimum value for this stat
 * @property {foundry.data.fields.NumberField} max - Maximum value for this stat
 * @property {foundry.data.fields.NumberField} value - Current value for this stat
 * @property {foundry.data.fields.NumberField} [base] - Base value for this stat (if enabled)
 * @property {foundry.data.fields.NumberField} [temp] - Temporary value for this stat (if enabled)
 * 
 * @typedef {Object} StatsSchema
 * @property {foundry.data.fields.SchemaField} hp - {@link StatField} Health Points with base and temp fields
 * @property {foundry.data.fields.SchemaField} mp - {@link StatField} Mana Points with base and temp fields
 * @property {foundry.data.fields.SchemaField} wither - {@link StatField} Wither stat (max: 100, initial: 20)
 * @property {foundry.data.fields.SchemaField} presence - {@link StatField} Presence stat (max: 1, initial: 0)
 */
export function _defineStats(schema) {
  schema.hp = statField("HP", { base: true, temp: true });
  schema.mp = statField("MP", { base: true, temp: true });
  schema.wither = statField("Wither", { max: 100, value: 20 });
  schema.presence = statField("Presence", { max: 1, value: 0 });
  return schema;
}
