const { fields } = foundry.data;
import { TeriockEffectData } from "./base.mjs";

export class TeriockResourceData extends TeriockEffectData {
  static defineSchema() {
    const commonData = super.defineSchema();
    return {
      ...commonData,
      consumable: new fields.BooleanField({ initial: true }),
      quantity: new fields.NumberField({ initial: 1, nullable: true }),
      maxQuantityRaw: new fields.StringField({ initial: null, nullable: true }),
      maxQuantity: new fields.NumberField({ initial: null, nullable: true }),
      rollFormula: new fields.StringField({ initial: "" }),
      functionHook: new fields.StringField({ initial: "none" }),
    }
  }
}