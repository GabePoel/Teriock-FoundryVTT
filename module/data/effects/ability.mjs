const { fields } = foundry.data;
import { TeriockEffectData } from "./base.mjs";

export class TeriockAbilityData extends TeriockEffectData {
  static defineSchema() {
    const commonData = super.defineSchema();
    return {
      ...commonData,
      
    }
  }
}