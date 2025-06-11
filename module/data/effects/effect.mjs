const { fields } = foundry.data;
import { TeriockEffectData } from "./base.mjs";

export class TeriockEffectData extends TeriockEffectData {
  static defineSchema() {
    const commonData = super.defineSchema();
    return {
      ...commonData,
      source: new fields.StringField({ initial: '', nullable: true }),
    }
  }
}