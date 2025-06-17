const { fields } = foundry.data;

function currencyField(label) {
  return new fields.NumberField({
    initial: 0,
    integer: true,
    min: 0,
    label: label,
  });
}

export function _defineMoney(schema) {
  schema.money = new fields.SchemaField({
    copper: currencyField("Copper Coins"),
    silver: currencyField("Silver Coins"),
    gold: currencyField("Gold Coins"),
    entTearAmber: currencyField("Ent Tear Ambers"),
    fireEyeRuby: currencyField("Fire Eye Rubies"),
    pixiePlumAmethyst: currencyField("Pixie Plum Amethysts"),
    snowDiamond: currencyField("Snow Diamonds"),
    dragonEmerald: currencyField("Dragon Emeralds"),
    moonOpal: currencyField("Moon Opals"),
    magusQuartz: currencyField("Magus Quartz"),
    heartstoneRuby: currencyField("Heartstone Rubies"),
    total: currencyField("Total Money"),
  });
  schema.moneyWeight = new fields.NumberField({
    initial: 0,
    label: "Money Weight",
    min: 0,
  });
  return schema;
}