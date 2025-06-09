const { fields } = foundry.data;
import { TeriockEffectData } from "./base.mjs";

export class TeriockPropertyData extends TeriockEffectData {
  static defineSchema() {
    const commonData = super.defineSchema();
    return {
      ...commonData,
      propertyType: new fields.StringField({ initial: "normal" }),
      damageType: new fields.StringField({ initial: "" }),
    }
  }
}