const { fields } = foundry.data;
import { TeriockItemData } from "./base.mjs";

export class TeriockPowerData extends TeriockItemData {
  static defineSchema() {
    const commonData = super.defineSchema();
    return {
      ...commonData,
      type: new fields.StringField({ initial: "other" }),
      flaws: new fields.HTMLField({ initial: "<p>None.</p>" }),
      proficient: new fields.BooleanField({ initial: true }),
      size: new fields.NumberField({ initial: 3 }),
      lifespan: new fields.NumberField({ initial: 100 }),
      adult: new fields.NumberField({ initial: 20 }),
    }
  }
}