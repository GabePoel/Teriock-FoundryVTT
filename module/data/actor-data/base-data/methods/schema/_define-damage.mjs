const { fields } = foundry.data;

export function _defineDamage(schema) {
  schema.damage = new fields.SchemaField({
    standard: new fields.StringField({
      initial: "",
      label: "Standard Damage",
    }),
    hand: new fields.StringField({
      initial: "1",
      label: "Hand Damage",
    }),
    foot: new fields.StringField({
      initial: "1",
      label: "Foot Damage",
    }),
    mouth: new fields.StringField({
      initial: "1",
      label: "Mouth Damage",
    }),
    bucklerShield: new fields.StringField({
      initial: "1",
      label: "Buckler Shield Damage",
    }),
    largeShield: new fields.StringField({
      initial: "1",
      label: "Large Shield Damage",
    }),
    towerShield: new fields.StringField({
      initial: "1",
      label: "Tower Shield Damage",
    }),
  });
  return schema;
}