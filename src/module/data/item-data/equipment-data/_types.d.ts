import type TeriockBaseItemModel from "../base-item-data/base-item-data.mjs";
import type { TeriockEquipment } from "../../../documents/_documents.mjs";
import type { ConsumableInterface } from "../../effect-data/shared/shared-fields";

declare module "./equipment-data.mjs" {
  export default interface TeriockEquipmentModel extends TeriockBaseItemModel, ConsumableInterface {
    /** <schema> Armor Value */
    av: number;
    /** <base> Armor value for effects to modify */
    baseAv: number;
    /** <base> Black value for effects to modify */
    baseBv: number;
    /** <schema> Block Value */
    bv: number;
    /** <schema> Damage Dice */
    damage: string;
    /** <schema> Damage Types */
    damageTypes: Set<string>;
    /** <schema> Is the equipment dampened? */
    dampened: boolean;
    /** <schema> Equipment Classes */
    equipmentClasses: Set<Teriock.Parameters.Equipment.EquipmentClass>;
    /** <schema> Canonical Equipment Type */
    equipmentType: string;
    /** <schema> Is the equipment equipped? */
    equipped: boolean;
    /** <schema> Flaws */
    flaws: string;
    /** <schema> Is the equipment glued? */
    glued: boolean;
    /** <base> Registered pseudo-hook macros to fire */
    hookedMacros: Teriock.Parameters.Equipment.HookedEquipmentMacros;
    /** <schema> Is the equipment identified? */
    identified: boolean;
    /** <schema> Minimum STR */
    minStr: number;
    /** <schema> Notes */
    notes: string;
    /** <schema> Power Level */
    powerLevel: string;
    /** <schema> Price */
    price: number;
    /** <schema> Range (ft) (if ranged) */
    range: number;
    /** <schema> Is the equipment ranged? */
    ranged: boolean;
    /** <schema> Identification Reference Equipment UUID */
    reference: Teriock.UUID<TeriockEquipment>;
    /** <schema> Style Bonus (Weapon Fighting Style) */
    sb: Teriock.Parameters.Equipment.WeaponFightingStyle;
    /** <schema> Is the equipment shattered? */
    shattered: boolean;
    /** <schema> Short Range (ft) (if ranged) */
    shortRange: number;
    /** <derived> Special Rules (Weapon Fighting Style) */
    specialRules: string;
    /** <schema> Presence Tier */
    tier: {
      /** <schema> Raw Presence Tier */
      raw: string;
      /** <derived> Derived Presence Tier */
      derived: number;
    };
    /** <schema> Two-handed Damage Dice */
    twoHandedDamage: string;
    /** <schema> Weight (lb) */
    weight: number;

    get parent(): TeriockEquipment;
  }
}
