const { fields } = foundry.data;

function appliesField() {
  return new fields.SchemaField({
    statuses: new fields.ArrayField(new fields.StringField()),
    damage: new fields.ArrayField(new fields.StringField()),
    drain: new fields.ArrayField(new fields.StringField()),
    changes: new fields.ArrayField(new fields.SchemaField({
      key: new fields.StringField({ initial: "" }),
      mode: new fields.NumberField({ initial: 4 }),
      value: new fields.StringField({ initial: "" }),
      priority: new fields.NumberField({ initial: 20 }),
    }))
  });
}

export function _defineApplies(schema) {
  schema.applies = new fields.SchemaField({
    base: appliesField(),
    proficient: appliesField(),
    fluent: appliesField(),
  });

  return schema;
}