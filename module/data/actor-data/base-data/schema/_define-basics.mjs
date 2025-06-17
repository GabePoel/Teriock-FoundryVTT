const { fields } = foundry.data;

function attributeField(name) {
  return new fields.SchemaField({
    saveProficient: new fields.BooleanField({
      initial: false,
      label: `Proficient in ${name} Saves`,
    }),
    saveFluent: new fields.BooleanField({
      initial: false,
      label: `Fluent in ${name} Saves`,
    }),
    value: new fields.NumberField({
      initial: -3,
      integer: true,
      label: `${name} Save Bonus`,
    }),
  });
}

export function _defineBasics(schema) {
  schema.lvl = new fields.NumberField({
    initial: 1,
    integer: true,
    label: "Level",
    min: 1,
  });
  schema.size = new fields.NumberField({
    initial: 3,
    label: "Size",
    max: 30,
    min: 0,
  });
  schema.attributes = new fields.SchemaField({
    int: attributeField("INT"),
    mov: attributeField("MOV"),
    per: attributeField("PER"),
    snk: attributeField("SNK"),
    str: attributeField("STR"),
    unp: attributeField("UNP"),
  });
  return schema;
}