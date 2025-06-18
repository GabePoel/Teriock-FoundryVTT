const { fields } = foundry.data;
import TeriockBaseEffectData from "../base-data/base-data.mjs";

export default class TeriockEffectData extends TeriockBaseEffectData {
  
  /** @override */
  static defineSchema() {
    const commonData = super.defineSchema();
    return {
      ...commonData,
      source: new fields.StringField({ initial: '', nullable: true }),
    }
  }
}