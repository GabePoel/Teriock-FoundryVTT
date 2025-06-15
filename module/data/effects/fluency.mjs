const { fields } = foundry.data;
import { TeriockEffectData } from "./base.mjs";

export class TeriockFluencyData extends TeriockEffectData {
  static defineSchema() {
    const commonData = super.defineSchema();
    return {
      ...commonData,
      wikiNamespace: new fields.StringField({ initial: "Tradecraft", gmOnly: true }),
      field: new fields.StringField({ initial: "artisan" }),
      tradecraft: new fields.StringField({ initial: "artist" }),
      proficient: new fields.BooleanField({ initial: true }),
      fluent: new fields.BooleanField({ initial: true }),
    }
  }
}