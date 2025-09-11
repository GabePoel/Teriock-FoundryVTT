const { fields } = foundry.data;

function displayField(size = "medium", gapless = false) {
  return new fields.SchemaField({
    size: new fields.StringField({ initial: size }),
    gapless: new fields.BooleanField({ initial: gapless }),
  });
}

export function _defineSheet(schema) {
  schema.sheet = new fields.SchemaField({
    display: new fields.SchemaField({
      ability: displayField("small", true),
      fluency: displayField(),
      rank: displayField(),
      equipment: displayField("small", true),
      power: displayField(),
      resource: displayField(),
      consequence: displayField("small", true),
    }),
    notes: new fields.HTMLField({ initial: "Notes can be added here." }),
    dieBox: new fields.HTMLField({ initial: "" }),
    primaryBlocker: new fields.StringField({
      initial: null,
      nullable: true,
    }),
    primaryAttacker: new fields.StringField({
      initial: null,
      nullable: true,
    }),
  });
  return schema;
}
