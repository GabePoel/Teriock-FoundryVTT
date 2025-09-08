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

/**
 * Defines the tradecrafts' schema.
 *
 * Relevant wiki pages:
 * - [Tradecrafts](https://wiki.teriock.com/index.php/Core:Tradecrafts)
 * - [Talented](https://wiki.teriock.com/index.php/Keyword:Talented)
 * - [Expertise](https://wiki.teriock.com/index.php/Keyword:Expertise)
 *
 * @example
 * ```js
 * const schema = {};
 * const tradecraftsSchema = _defineTradecrafts(schema);
 * // tradecraftsSchema now contains: `tradecrafts` field with all available tradecrafts
 * ```
 *
 * @param {Object} schema - The schema object to extend with tradecraft fields
 * @returns {Object} The modified schema object with tradecraft fields added
 */
export function _defineTradecrafts(schema) {
  const tradecraftData = {};
  for (const key of Object.keys(TERIOCK.index.tradecrafts)) {
    tradecraftData[key] = tradecraftField();
  }
  schema.tradecrafts = new fields.SchemaField(tradecraftData);
  return schema;
}
