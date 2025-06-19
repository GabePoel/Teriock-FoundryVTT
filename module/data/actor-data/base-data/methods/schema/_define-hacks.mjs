const { fields } = foundry.data;

function hackField(max, name) {
  return new fields.SchemaField({
    min: new fields.NumberField({
      initial: 0,
      integer: true,
      label: `Minimum ${name} Hack`,
    }),
    max: new fields.NumberField({
      initial: max,
      integer: true,
      label: `Maximum ${name} Hack`,
    }),
    value: new fields.NumberField({
      initial: 0,
      integer: true,
      label: `Current ${name} Hack`,
    }),
  });
}

export function _defineHacks(schema) {
  schema.hacks = new fields.SchemaField({
    arm: hackField(2, "Arm"),
    leg: hackField(2, "Leg"),
    body: hackField(1, "Body"),
    eye: hackField(1, "Eye"),
    ear: hackField(1, "Ear"),
    mouth: hackField(1, "Mouth"),
    nose: hackField(1, "Nose"),
  });
  return schema;
}
