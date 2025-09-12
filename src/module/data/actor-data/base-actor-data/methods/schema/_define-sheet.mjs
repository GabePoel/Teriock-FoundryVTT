const { fields } = foundry.data;

function displayField(size = "medium", gapless = false) {
  return new fields.SchemaField({
    gapless: new fields.BooleanField({ initial: gapless }),
    size: new fields.StringField({ initial: size }),
  });
}

export function _defineSheet(schema) {
  schema.sheet = new fields.SchemaField({
    dieBox: new fields.HTMLField({ initial: "" }),
    display: new fields.SchemaField({
      ability: displayField("small", true),
      consequence: displayField("small", true),
      equipment: displayField("small", true),
      fluency: displayField(),
      power: displayField(),
      rank: displayField(),
      resource: displayField(),
    }),
    notes: new fields.HTMLField({ initial: "Notes can be added here." }),
    primaryAttacker: new fields.StringField({
      initial: null,
      nullable: true,
    }),
    primaryBlocker: new fields.StringField({
      initial: null,
      nullable: true,
    }),
  });
  return schema;
}
