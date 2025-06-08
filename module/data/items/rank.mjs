const { fields } = foundry.data;
import { TeriockItemData } from "./base.mjs";

export class TeriockRankData extends TeriockItemData {
  static defineSchema() {
    const commonData = super.defineSchema();
    return {
      ...commonData,
      wikiNamespace: new fields.StringField({ initial: "Class" }),
      flaws: new fields.HTMLField({ initial: "" }),
      archetype: new fields.StringField({ initial: "semi" }),
      className: new fields.StringField({ initial: "archer" }),
      classRank: new fields.NumberField({ initial: 0 }),
      hitDieSpent: new fields.BooleanField({ initial: false }),
      manaDieSpent: new fields.BooleanField({ initial: false }),
      hitDie: new fields.StringField({ initial: "d10" }),
      manaDie: new fields.StringField({ initial: "d10" }),
      hp: new fields.NumberField({ initial: 6 }),
      mp: new fields.NumberField({ initial: 6 }),
      maxAv: new fields.NumberField({ initial: 2 }),
    }
  }
}