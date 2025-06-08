const { fields } = foundry.data;
import { TeriockItemData } from "./base.mjs";

export class TeriockRankData extends TeriockItemData {
  static defineSchema() {
    const commonData = super.defineSchema();
    return {
      ...commonData,
      wikiNamespace: new fields.StringField({ initial: "Class" }),
      description: new fields.HTMLField({ initial: "<p>Every adventurer is a journeyman before they join their first class.</p>" }),
      flaws: new fields.HTMLField({ initial: "<p>None.</p>" }),
      archetype: new fields.StringField({ initial: "everyman" }),
      className: new fields.StringField({ initial: "journeyman" }),
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