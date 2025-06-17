const { fields } = foundry.data;

function statField(name, options = {}) {
  const schema = {
    min: new fields.NumberField({
      initial: options.min || 0,
      integer: true,
      label: `Minimum ${name}`,
    }),
    max: new fields.NumberField({
      initial: options.max || 1,
      integer: true,
      label: `Maximum ${name}`,
    }),
    value: new fields.NumberField({
      initial: options.value || 1,
      integer: true,
      label: `Current ${name}`,
    }),
  }
  if (options.base) {
    schema.base = new fields.NumberField({
      initial: options.base || 1,
      integer: true,
      label: `Base ${name}`,
    })
  }
  if (options.temp) {
    schema.temp = new fields.NumberField({
      initial: options.temp || 0,
      integer: true,
      label: `Temporary ${name}`,
    })
  }
  return new fields.SchemaField(schema)
}

export function _defineStats(schema) {
  schema.hp = statField("HP", { base: true, temp: true });
  schema.mp = statField("MP", { base: true, temp: true });
  schema.wither = statField("Wither", { max: 100, value: 20 });
  schema.presence = statField("Presence", { max: 1, value: 0 });
  return schema;
}