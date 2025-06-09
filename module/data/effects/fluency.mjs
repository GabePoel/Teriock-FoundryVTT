const { fields } = foundry.data;
import { TeriockEffectData } from "./base.mjs";

export class TeriockFluencyData extends TeriockEffectData {
  static defineSchema() {
    const commonData = super.defineSchema();
    return {
      ...commonData,
      field: new fields.StringField({ initial: "artisan" }),
      tradecraft: new fields.StringField({ initial: "artist" }),
    }
  }
}