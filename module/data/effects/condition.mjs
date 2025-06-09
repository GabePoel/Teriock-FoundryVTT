import { TeriockEffectData } from "./base.mjs";

export class TeriockConditionData extends TeriockEffectData {
  static defineSchema() {
    const commonData = super.defineSchema();
    return {
      ...commonData,
    }
  }
}