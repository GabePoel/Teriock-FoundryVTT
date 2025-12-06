import { EvaluationField } from "../../../../fields/_module.mjs";

const { fields } = foundry.data;

/**
 * Defines the `capacities` schema for actor data including movement speed, carrying capacity, and weight.
 *
 * Relevant wiki pages:
 * - [Movement Speed](https://wiki.teriock.com/index.php/Core:Movement_Speed)
 * - [Carrying Capacity](https://wiki.teriock.com/index.php/Core:Carrying_Capacity)
 * - [Weight](https://wiki.teriock.com/index.php/Core:Weight)
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
    heavy: new fields.NumberField({
      initial: 130,
      min: 0,
      label: "Heavy Carrying Capacity",
    }),
    light: new fields.NumberField({
      initial: 65,
      label: "Light Carrying Capacity",
      min: 0,
    }),
    max: new fields.NumberField({
      initial: 195,
      label: "Maximum Carrying Capacity",
      min: 0,
    }),
  });
  schema.weight = new fields.SchemaField({
    self: new EvaluationField({
      blank: "pow(3 + @size, 3)",
      initial: "pow(3 + @size, 3)",
      min: 0,
    }),
  });
  schema.attunements = new fields.SetField(new fields.DocumentIdField(), {
    label: "Attunements",
    hint: "The documents that the actor is attuned to.",
  });
  return schema;
}
