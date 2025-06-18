const { fields } = foundry.data;
import { mergeLevel } from "../../../../../helpers/utils.mjs";
import { tradecraftOptions } from "../../../../../helpers/constants/tradecraft-options.mjs";

function tradecraftField() {
  return new fields.SchemaField({
    proficient: new fields.BooleanField({ initial: false }),
    extra: new fields.NumberField({ initial: 0 }),
    bonus: new fields.NumberField({ initial: 0 }),
  })
}

const tradecrafts = mergeLevel(tradecraftOptions, "*", "tradecrafts");

export function _defineTradecrafts(schema) {
  const tradecraftData = {};
  for (const key of Object.keys(tradecrafts)) {
    tradecraftData[key] = tradecraftField();
  }
  const tradecraftsField = new fields.SchemaField(tradecraftData);
  schema.tradecrafts = tradecraftsField;
  return schema;
}