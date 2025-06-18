const { fields } = foundry.data;

export function _defineCombat(schema) {
  schema.wornAc = new fields.NumberField({
    initial: 0,
    integer: true,
    label: "Worn Armor Class",
    min: 0,
  });
  schema.naturalAv = new fields.NumberField({
    initial: 0,
    integer: true,
    label: "Natural Armor Value",
    min: 0,
  });
  schema.attackPenalty = new fields.NumberField({
    initial: 0,
    integer: true,
    label: "Attack Penalty",
    max: 0,
    step: 3,
  });
  schema.sb = new fields.BooleanField({
    initial: false,
    label: "Style Bonus",
  });
  schema.piercing = new fields.StringField({
    initial: "none",
    label: "Piercing",
    choices: {
      none: "None",
      av0: "AV0",
      ub: "UB",
    }
  });
  return schema;
}