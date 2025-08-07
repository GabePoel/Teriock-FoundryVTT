import TeriockBaseItemData from "../base-item-data/base-item-data.mjs";
import { TeriockEquipment } from "../../../documents/_documents.mjs";

declare module "./equipment-data.mjs" {
  export default interface TeriockEquipmentData extends TeriockBaseItemData {
    /** Parent */
    parent: TeriockEquipment;
    /** Is the equipment equipped? */
    equipped: boolean;
    /** Is the equipment glued? */
    glued: boolean;
    /** Is the equipment shattered? */
    shattered: boolean;
    /** Is the equipment dampened? */
    dampened: boolean;
    /** Is the equipment consumable? */
    consumable: boolean;
    /** Quantity (if consumable) */
    quantity: number;
    /** Max Quantity (if consumable) */
    maxQuantity: {
      /** Raw Max Quantity Value */
      raw: string;
      /** Derived Max Quantity Value */
      derived: number;
    };
    /** Is the equipment ranged? */
    ranged: boolean;
    /** Damage Dice */
    damage: string;
    /** Two-handed Damage Dice */
    twoHandedDamage: string;
    /** Damage Types */
    damageTypes: Set<string>;
    /** Weight (lb) */
    weight: number;
    /** Range (ft) (if ranged) */
    range: number;
    /** Short Range (ft) (if ranged) */
    shortRange: number;
    /** Equipment Classes */
    equipmentClasses: Set<Teriock.EquipmentClass>;
    /** Minimum STR */
    minStr: number;
    /** Style Bonus (Weapon Fighting Style) */
    sb: Teriock.WeaponFightingStyle;
    /** Armor Value */
    av: number;
    /** Block Value */
    bv: number;
    /** Special Rules (Weapon Fighting Style) */
    specialRules: string;
    /** Canonical Equipment Type */
    equipmentType: string;
    /** Price */
    price: number;
    /** Power Level */
    powerLevel: string;
    /** Flaws */
    flaws: string;
    /** Notes */
    notes: string;
    /** Presence Tier */
    tier: {
      /** Raw Presence Tier */
      raw: string;
      /** Derived Presence Tier */
      derived: number;
    };
    /** Is the equipment identified? */
    identified: boolean;
    /** Identification Reference Equipment UUID */
    reference: Teriock.UUID<TeriockEquipment>;
  }
}
