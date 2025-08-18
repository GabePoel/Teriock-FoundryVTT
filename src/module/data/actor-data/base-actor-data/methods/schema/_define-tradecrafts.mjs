import { tradecraftOptions } from "../../../../../constants/tradecraft-options.mjs";
import { mergeLevel } from "../../../../../helpers/utils.mjs";

const { fields } = foundry.data;

/**
 * Creates a tradecraft field definition with proficiency, extra, and bonus tracking.
 *
 * Relevant wiki pages:
 * - [Tradecrafts](https://wiki.teriock.com/index.php/Core:Tradecrafts)
 * - [Talented](https://wiki.teriock.com/index.php/Keyword:Talented)
 * - [Expertise](https://wiki.teriock.com/index.php/Keyword:Expertise)
 *
 * @returns {SchemaField} A schema field containing:
 *   - proficient: Boolean indicating if proficient in this tradecraft
 *   - extra: Number of extra levels/ranks in this tradecraft
 *   - bonus: Additional bonus value for this tradecraft
 */
function tradecraftField() {
  return new fields.SchemaField({
    proficient: new fields.BooleanField({ initial: false }),
    extra: new fields.NumberField({ initial: 0 }),
    bonus: new fields.NumberField({ initial: 0 }),
  });
}

const tradecrafts = mergeLevel(tradecraftOptions, "*", "tradecrafts");

/**
 * Defines the tradecrafts' schema.
 *
 * Relevant wiki pages:
 * - [Tradecrafts](https://wiki.teriock.com/index.php/Core:Tradecrafts)
 * - [Talented](https://wiki.teriock.com/index.php/Keyword:Talented)
 * - [Expertise](https://wiki.teriock.com/index.php/Keyword:Expertise)
 *
 * @param {Object} schema - The schema object to extend with tradecraft fields
 * @returns {Object} The modified schema object with tradecraft fields added
 *
 * @example
 * ```javascript
 * const schema = {};
 * const tradecraftsSchema = _defineTradecrafts(schema);
 * // tradecraftsSchema now contains: tradecrafts field with all available tradecrafts
 * ```
 *
 * @typedef {Object} TradecraftField
 * @property {BooleanField} proficient - Whether proficient in this tradecraft
 * @property {NumberField} extra - Additional modifier for this tradecraft (≥0)
 * @property {NumberField} bonus - Calculated bonus value for this tradecraft (≥0)
 *
 * @typedef {Object} TradecraftsSchema
 * @property {SchemaField} tradecrafts - Object containing all available tradecraft fields,
 *   where each key is a tradecraft name and each value is a {@link TradecraftField}
 */
export function _defineTradecrafts(schema) {
  const tradecraftData = {};
  for (const key of Object.keys(tradecrafts)) {
    tradecraftData[key] = tradecraftField();
  }
  schema.tradecrafts = new fields.SchemaField(tradecraftData);
  return schema;
}
