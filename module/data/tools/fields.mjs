const { fields } = foundry.data;
export function dynamicField(options = {}) {
  const rawOptions = {
    ...options,
    nullable: true,
  }
  const valueOptions = {
    ...options,
    initial: 0,
  }
  if (!options.initial) {
    rawOptions.initial = '0';
  }
  return new fields.SchemaField({
    raw: new fields.StringField(rawOptions),
    value: new fields.NumberField(valueOptions),
  })
}