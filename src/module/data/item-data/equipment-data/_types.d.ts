import type TeriockBaseItemModel from "../base-item-data/base-item-data.mjs";
import type { TeriockEquipment } from "../../../documents/_documents.mjs";
import type { ExecutableDataMixinInterface } from "../../mixins/executable-data-mixin/_types";
import type { ConsumableDataMixinInterface } from "../../mixins/consumable-data-mixin/_types";

declare module "./equipment-data.mjs" {
  export default interface TeriockEquipmentModel
    extends TeriockBaseItemModel,
      ConsumableDataMixinInterface,
      ExecutableDataMixinInterface {
    /** <schema> Armor Value */
    av: Teriock.Fields.ModifiableNumber;
    /** <schema> Block Value */
    bv: Teriock.Fields.ModifiableNumber;
    /** <schema> Damage Dice */
    damage: {
      /** <schema> Damage this always deals */
      base: Teriock.Fields.ModifiableIndeterministic;
      /** <schema> Damage this deals in two hands */
      twoHanded: Teriock.Fields.ModifiableIndeterministic;
      /** <schema> Additional damage types to be added to all the base damage */
      types: Set<string>;
    };
    /** <schema> Is the equipment dampened? */
    dampened: boolean;
    /** <schema> Equipment Classes */
    equipmentClasses: Set<Teriock.Parameters.Equipment.EquipmentClass>;
    /** <schema> Canonical Equipment Type */
    equipmentType: string;
    /** <schema> Is the equipment equipped? */
    equipped: boolean;
    /** <schema> Style Bonus (Weapon Fighting Style) */
    fightingStyle: Teriock.Parameters.Equipment.WeaponFightingStyle;
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
    /** <base> Piercing */
    piercing: {
      /** <base> <special> If the equipment is AV0 */
      av0: boolean;
      /** <base> If the equipment is UB */
      ub: boolean;
    };
    /** <schema> Power Level */
    powerLevel: string;
    /** <schema> Price */
    price: number;
    /** <schema> Range (ft) (if ranged) */
    range: {
      /** <schema> Long range (this is the default range) */
      long: Teriock.Fields.ModifiableDeterministic;
      /** <schema> Is the equipment ranged? */
      ranged: boolean;
      /** <schema> Short range */
      short: Teriock.Fields.ModifiableDeterministic;
    };
    /** <schema> Identification Reference Equipment UUID */
    reference: Teriock.UUID<TeriockEquipment>;
    /** <schema> Is the equipment shattered? */
    shattered: boolean;
    /** <derived> Special Rules (Weapon Fighting Style) */
    specialRules: string;
    /** <schema> Spell Turning */
    spellTurning: boolean;
    /** <schema> Presence Tier */
    tier: Teriock.Fields.ModifiableDeterministic;
    /** <schema> <special> Virtual Properties */
    virtualProperties: Set<string>;
    /** <base> Warded */
    warded: boolean;
    /** <schema> Weight (lb) */
    weight: Teriock.Fields.ModifiableNumber & {
      /** <special> Weight times quantity */
      total: number;
    };

    get parent(): TeriockEquipment;
  }
}
