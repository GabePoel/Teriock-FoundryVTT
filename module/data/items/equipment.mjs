const { fields } = foundry.data;
import { TeriockItemData } from "./base.mjs";

export class TeriockEquipmentData extends TeriockItemData {
  static defineSchema() {
    const commonData = super.defineSchema();
    return {
      ...commonData,
      wikiNamespace: new fields.StringField({ initial: "Equipment", gmOnly: true }),
      equipped: new fields.BooleanField({ initial: true }),
      glued: new fields.BooleanField({ initial: false }),
      shattered: new fields.BooleanField({ initial: false }),
      dampened: new fields.BooleanField({ initial: false }),
      consumable: new fields.BooleanField({ initial: false }),
      quantity: new fields.NumberField({ initial: 1 }),
      maxQuantity: new fields.NumberField({ initial: null, nullable: true }),
      maxQuantityRaw: new fields.StringField({ initial: null, nullable: true }),
      ranged: new fields.BooleanField({ initial: false }),
      damage: new fields.StringField({ initial: "0" }),
      twoHandedDamage: new fields.StringField({ initial: "0" }),
      damageTypes: new fields.ArrayField(new fields.StringField()),
      weight: new fields.NumberField({ initial: 0 }),
      range: new fields.NumberField({ initial: 0 }),
      shortRange: new fields.NumberField({ initial: 0 }),
      equipmentClasses: new fields.ArrayField(new fields.StringField()),
      minStr: new fields.NumberField({ initial: -3 }),
      sb: new fields.StringField({ initial: null, nullable: true }),
      av: new fields.NumberField({ initial: 0 }),
      bv: new fields.NumberField({ initial: 0 }),
      specialRules: new fields.HTMLField({ initial: "" }),
      equipmentType: new fields.StringField({ initial: "Equipment Type" }),
      powerLevel: new fields.StringField({ initial: "mundane" }),
      flaws: new fields.HTMLField({ initial: "" }),
      notes: new fields.HTMLField({ initial: "" }),
      tier: new fields.NumberField({ initial: 0 }),
      fullTier: new fields.StringField({ initial: "" }),
      manaStoring: new fields.StringField({ initial: "" }),
      identified: new fields.BooleanField({ initial: false }),
      reference: new fields.StringField({ initial: null, nullable: true, gmOnly: true }),
    }
  }
}
