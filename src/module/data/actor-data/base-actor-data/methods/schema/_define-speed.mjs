const { fields } = foundry.data;

/**
 * Creates a speed adjustment field definition for different movement types.
 *
 * Relevant wiki pages:
 * - [Movement Speed](https://wiki.teriock.com/index.php/Core:Movement_Speed)
 *
 * @param {number} initial - The initial speed adjustment value (0-4)
 * @param {string} name - The display name for this speed adjustment type
 * @returns {NumberField} A number field for tracking speed adjustments
 */
function speedField(initial, name) {
  return new fields.NumberField({
    initial: initial,
    integer: true,
    max: 4,
    min: 0,
    step: 1,
    label: `${name} Speed Adjustment`,
  });
}

/**
 * Defines the speed adjustments schema.
 *
 * Relevant wiki pages:
 * - [Movement Speed](https://wiki.teriock.com/index.php/Core:Movement_Speed)
 *
 * @param {Object} schema - The schema object to extend with speed adjustment fields
 * @returns {Object} The modified schema object with speed adjustment fields added
 *
 * @example
 * ```javascript
 * const schema = {};
 * const speedSchema = _defineSpeed(schema);
 * // speedSchema now contains: speedAdjustments field
 * ```
 *
 * @typedef {Object} SpeedAdjustmentsSchema
 * @property {NumberField} walk - Walking speed adjustment (0-4)
 * @property {NumberField} climb - Climbing speed adjustment (0-4)
 * @property {NumberField} crawl - Crawling speed adjustment (0-4)
 * @property {NumberField} difficultTerrain - Movement in difficult terrain adjustment (0-4)
 * @property {NumberField} dig - Digging speed adjustment (0-4)
 * @property {NumberField} dive - Diving/swimming underwater adjustment (0-4)
 * @property {NumberField} fly - Flying speed adjustment (0-4)
 * @property {NumberField} hidden - Movement while hidden adjustment (0-4)
 * @property {NumberField} leapHorizontal - Horizontal jumping distance adjustment (0-4)
 * @property {NumberField} leapVertical - Vertical jumping height adjustment (0-4)
 * @property {NumberField} swim - Swimming speed adjustment (0-4)
 */
export function _defineSpeed(schema) {
  schema.speedAdjustments = new fields.SchemaField({
    walk: speedField(3, "Walk"),
    climb: speedField(1, "Climb"),
    crawl: speedField(1, "Crawl"),
    difficultTerrain: speedField(2, "Difficult Terrain"),
    dig: speedField(0, "Dig"),
    dive: speedField(0, "Dive"),
    fly: speedField(0, "Fly"),
    hidden: speedField(1, "Hidden"),
    leapHorizontal: speedField(1, "Horizontal Leap"),
    leapVertical: speedField(0, "Vertical Leap"),
    swim: speedField(1, "Swim"),
  });
  return schema;
}
