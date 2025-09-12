const { fields } = foundry.data;

/**
 * Defines the `capacities` schema for actor data including movement speed, carrying capacity, and weight.
 *
 * Relevant wiki pages:
 * - [Movement Speed](https://wiki.teriock.com/index.php/Core:Movement_Speed)
 * - [Carrying Capacity](https://wiki.teriock.com/index.php/Core:Carrying_Capacity)
 * - [Weight](https://wiki.teriock.com/index.php/Core:Weight)
 *
 * @example
 * ```js
 * const schema = {};
 * const capacitiesSchema = _defineCapacities(schema);
 * // capacitiesSchema now contains: movementSpeed, carryingCapacity, and weight fields
 * ```
 *
 * @param {object} schema - The schema object to extend with capacity fields
 * @returns {object} The modified schema object with capacity fields added
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
  schema.attunements = new fields.SetField(new fields.DocumentIdField(), {
    label: "Attunements",
    hint: "The documents that the actor is attuned to.",
  });
  return schema;
}
