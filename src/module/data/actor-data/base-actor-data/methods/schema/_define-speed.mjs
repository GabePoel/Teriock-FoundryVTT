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
    label: `${name} Speed Adjustment`,
    max: 4,
    min: 0,
    step: 1,
  });
}

/**
 * Defines the speed adjustments schema.
 *
 * Relevant wiki pages:
 * - [Movement Speed](https://wiki.teriock.com/index.php/Core:Movement_Speed)
 *
 * @example
 * ```js
 * const schema = {};
 * const speedSchema = _defineSpeed(schema);
 * // speedSchema now contains: speedAdjustments field
 * ```
 *
 * @param {object} schema - The schema object to extend with speed adjustment fields
 * @returns {object} The modified schema object with speed adjustment fields added
 */
export function _defineSpeed(schema) {
  schema.speedAdjustments = new fields.SchemaField({
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
    walk: speedField(3, "Walk"),
  });
  return schema;
}
