const { fields } = foundry.data;

/**
 * Defines the capacities schema for actor data including movement speed, carrying capacity, and weight.
 *
 * Relevant wiki pages:
 * - [Movement Speed](https://wiki.teriock.com/index.php/Core:Movement_Speed)
 * - [Carrying Capacity](https://wiki.teriock.com/index.php/Core:Carrying_Capacity)
 * - [Weight](https://wiki.teriock.com/index.php/Core:Weight)
 *
 * @param {Object} schema - The schema object to extend with capacity fields
 * @returns {Object} The modified schema object with capacity fields added
 *
 * @example
 * ```javascript
 * const schema = {};
 * const capacitiesSchema = _defineCapacities(schema);
 * // capacitiesSchema now contains: movementSpeed, carryingCapacity, and weight fields
 * ```
 *
 * @typedef {Object} CarryingCapacityField
 * @property {foundry.data.fields.NumberField} light - Light carrying capacity (≥0)
 * @property {foundry.data.fields.NumberField} heavy - Heavy carrying capacity (≥0)
 * @property {foundry.data.fields.NumberField} max - Maximum carrying capacity (≥0)
 *
 * @typedef {Object} MovementSpeedField
 * @property {foundry.data.fields.NumberField} base - Base movement speed in feet per round (integer)
 * @property {foundry.data.fields.NumberField} value - Current movement speed in feet per round (integer)
 *
 * @typedef {Object} CapacitiesSchema
 * @property {foundry.data.fields.SchemaField} movementSpeed - {@link MovementSpeedField} Object containing movement speed fields
 * @property {foundry.data.fields.SchemaField} carryingCapacity - {@link CarryingCapacityField} Object containing carrying capacity tiers
 * @property {foundry.data.fields.NumberField} weight - Current weight of the actor in pounds (≥0, integer)
 */
export function _defineCapacities(schema) {
  schema.movementSpeed = new fields.SchemaField({
    base: new fields.NumberField({
      initial: 0,
      integer: true,
      label: "Base Movement Speed",
    }),
    value: new fields.NumberField({
      initial: 30,
      integer: true,
      label: "Movement Speed",
    }),
  });
  schema.carryingCapacity = new fields.SchemaField({
    light: new fields.NumberField({
      initial: 65,
      min: 0,
      label: "Light Carrying Capacity",
    }),
    heavy: new fields.NumberField({
      initial: 130,
      min: 0,
      label: "Heavy Carrying Capacity",
    }),
    max: new fields.NumberField({
      initial: 195,
      min: 0,
      label: "Maximum Carrying Capacity",
    }),
  });
  schema.weight = new fields.NumberField({
    initial: 216,
    integer: true,
    label: "Weight",
    min: 0,
  });
  return schema;
}
