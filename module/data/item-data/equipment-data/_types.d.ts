import type TeriockBaseItemData from "../base-data/base-data.mjs";

declare module "./equipment-data.mjs" {
  export default interface TeriockEquipmentData extends TeriockBaseItemData {
    wikiNamespace: string;
    equipped: boolean;
    glued: boolean;
    shattered: boolean;
    dampened: boolean;
    consumable: boolean;
    quantity: number;
    maxQuantity: {
      raw: string;
      derived: number;
    };
    ranged: boolean;
    damage: string;
    twoHandedDamage: string;
    damageTypes: string[];
    weight: number;
    range: number;
    shortRange: number;
    equipmentClasses: string[];
    minStr: number;
    sb: string;
    av: number;
    bv: number;
    specialRules: string;
    equipmentType: string;
    powerLevel: string;
    flaws: string;
    notes: string;
    tier: number;
    fullTier: string;
    manaStoring: string;
    identifier: boolean;
    reference: string;
  }
}
