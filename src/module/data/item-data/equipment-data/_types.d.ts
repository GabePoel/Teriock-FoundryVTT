import type TeriockBaseItemModel from "../base-item-data/base-item-data.mjs";
import type { TeriockEquipment } from "../../../documents/_documents.mjs";
import type { ConsumableInterface } from "../../effect-data/shared/shared-fields";
import type { TeriockMacro } from "../../../documents/_module.mjs";

declare module "./equipment-data.mjs" {
  export default interface TeriockEquipmentModel extends TeriockBaseItemModel, ConsumableInterface {
    /** Armor Value */
    av: number;
    /** Armor value for effects to modify */
    baseAv: number;
    /** Black value for effects to modify */
    baseBv: number;
    /** Block Value */
    bv: number;
    /** Damage Dice */
    damage: string;
    /** Damage Types */
    damageTypes: Set<string>;
    /** Is the equipment dampened? */
    dampened: boolean;
    /** Equipment Classes */
    equipmentClasses: Set<Teriock.Parameters.Equipment.EquipmentClass>;
    /** Canonical Equipment Type */
    equipmentType: string;
    /** Is the equipment equipped? */
    equipped: boolean;
    /** Flaws */
    flaws: string;
    /** Is the equipment glued? */
    glued: boolean;
    /** Is the equipment identified? */
    identified: boolean;
    /** Minimum STR */
    minStr: number;
    /** Notes */
    notes: string;
    /** Power Level */
    powerLevel: string;
    /** Price */
    price: number;
    /** Range (ft) (if ranged) */
    range: number;
    /** Is the equipment ranged? */
    ranged: boolean;
    /** Identification Reference Equipment UUID */
    reference: Teriock.UUID<TeriockEquipment>;
    /** Style Bonus (Weapon Fighting Style) */
    sb: Teriock.Parameters.Equipment.WeaponFightingStyle;
    /** Is the equipment shattered? */
    shattered: boolean;
    /** Short Range (ft) (if ranged) */
    shortRange: number;
    /** Special Rules (Weapon Fighting Style) */
    specialRules: string;
    /** Presence Tier */
    tier: {
      /** Raw Presence Tier */
      raw: string;
      /** Derived Presence Tier */
      derived: number;
    };
    /** Two-handed Damage Dice */
    twoHandedDamage: string;
    /** Weight (lb) */
    weight: number;
    /** Registered pseudo-hook macros to fire */
    hookedMacros: Record<Teriock.Parameters.Shared.PropertyPseudoHook, Teriock.UUID<TeriockMacro>[]>;

    get parent(): TeriockEquipment;
  }
}
