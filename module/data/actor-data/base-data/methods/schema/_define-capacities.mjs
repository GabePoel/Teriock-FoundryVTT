const { fields } = foundry.data;

export function _defineCapacities(schema) {
  schema.movementSpeed = new fields.NumberField({
    initial: 30,
    integer: true,
    label: "Movement Speed",
    min: 0,
  });
  schema.carryingCapacity = new fields.SchemaField({
    light: new fields.NumberField({
      initial: 65,
      min: 0,
      label: "Light Carrying Capacity"
    }),
    heavy: new fields.NumberField({
      initial: 130,
      min: 0,
      label: "Heavy Carrying Capacity"
    }),
    max: new fields.NumberField({
      initial: 195,
      min: 0,
      label: "Maximum Carrying Capacity"
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