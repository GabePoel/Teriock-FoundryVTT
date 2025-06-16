const { fields } = foundry.data;

export function appliesField() {
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