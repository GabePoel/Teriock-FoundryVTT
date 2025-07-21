const { fields } = foundry.data;

/**
 * Creates a currency field definition for tracking different types of money.
 *
 * @param {string} label - The display label for this currency type
 * @param {boolean} [integer] - If value must be an integer.
 * @returns {NumberField} A number field for tracking currency amounts
 */
function currencyField(label, integer = true) {
  return new fields.NumberField({
    initial: 0,
    integer: integer,
    min: 0,
    label: label,
  });
}

/**
 * Defines the money schema fields for actor data including various currency types and weight tracking.
 *
 * @param {Object} schema - The schema object to extend with money fields
 * @returns {Object} The modified schema object with money fields added
 *
 * @example
 * ```javascript
 * const schema = {};
 * const moneySchema = _defineMoney(schema);
 * // moneySchema now contains: money and moneyWeight fields
 * ```
 *
 * @typedef {Object} CurrencyField
 * @property {NumberField} copper - Copper coins (coin)
 * @property {NumberField} silver - Silver coins (coin)
 * @property {NumberField} gold - Gold coins (coin)
 * @property {NumberField} entTearAmber - Ent Tear Amber (gem)
 * @property {NumberField} fireEyeRuby - Fire Eye Rubies (gem)
 * @property {NumberField} pixiePlumAmethyst - Pixie Plum Amethysts (gem)
 * @property {NumberField} snowDiamond - Snow Diamonds (gem)
 * @property {NumberField} dragonEmerald - Dragon Emeralds (gem)
 * @property {NumberField} moonOpal - Moon Opals (gem)
 * @property {NumberField} magusQuartz - Magus Quartz (gem)
 * @property {NumberField} heartstoneRuby - Heartstone Rubies (gem)
 * @property {NumberField} debt - Debt (no weight)
 * @property {NumberField} total - Total money value (calculated field)
 *
 * @typedef {Object} MoneySchema
 * @property {SchemaField} money - {@link CurrencyField} Object containing all currency types
 * @property {NumberField} moneyWeight - Weight of carried money (≥0)
 */
export function _defineMoney(schema) {
  schema.money = new fields.SchemaField({
    copper: currencyField("Copper Coins"),
    silver: currencyField("Silver Coins"),
    gold: currencyField("Gold Coins"),
    entTearAmber: currencyField("Ent Tear Amber"),
    fireEyeRuby: currencyField("Fire Eye Rubies"),
    pixiePlumAmethyst: currencyField("Pixie Plum Amethysts"),
    snowDiamond: currencyField("Snow Diamonds"),
    dragonEmerald: currencyField("Dragon Emeralds"),
    moonOpal: currencyField("Moon Opals"),
    magusQuartz: currencyField("Magus Quartz"),
    heartstoneRuby: currencyField("Heartstone Rubies"),
    debt: currencyField("Debt", false),
    total: currencyField("Total Money", false),
  });
  schema.interestRate = new fields.NumberField({
    initial: 1,
    label: "Interest Rate",
    integer: false,
  });
  schema.moneyWeight = new fields.NumberField({
    initial: 0,
    label: "Money Weight",
    min: 0,
    integer: false,
  });
  return schema;
}
