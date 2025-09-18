import type TeriockBaseItemModel from "../base-item-data/base-item-data.mjs";
import type { TeriockEquipment } from "../../../documents/_documents.mjs";
import type { ExecutableDataMixinInterface } from "../../mixins/executable-data-mixin/_types";
import type { ConsumableDataMixinInterface } from "../../mixins/consumable-data-mixin/_types";

declare module "./equipment-data.mjs" {
  export default interface TeriockEquipmentModel extends TeriockBaseItemModel,
    ConsumableDataMixinInterface,
    ExecutableDataMixinInterface {
    /** <schema> Armor Value */
    av: Teriock.Fields.ModifiableNumber;
    /** <schema> Block Value */
    bv: Teriock.Fields.ModifiableNumber;
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
    minStr: Teriock.Fields.ModifiableNumber;
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
    tier: Teriock.Fields.ModifiableDeterministic;
    /** <schema> Two-handed Damage Dice */
    twoHandedDamage: string;
    /** <schema> Weight (lb) */
    weight: Teriock.Fields.ModifiableNumber;

    get parent(): TeriockEquipment;
  }
}
