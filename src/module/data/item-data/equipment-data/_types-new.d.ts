import type TeriockBaseItemModel from "../base-item-data/base-item-data.mjs";
import type { TeriockEquipment } from "../../../documents/_documents.mjs";
import type { ExecutableDataMixinInterface } from "../../mixins/executable-data-mixin/_types";
import type { ConsumableDataMixinInterface } from "../../mixins/consumable-data-mixin/_types";


export default interface NewTeriockEquipmentModel extends TeriockBaseItemModel,
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
  range: {
    /** <schema> Is the equipment ranged? */
    ranged: boolean;
    short: Teriock.Fields.ModifiableDeterministic;
    long: Teriock.Fields.ModifiableDeterministic;
  };
  /** <schema> Identification Reference Equipment UUID */
  reference: Teriock.UUID<TeriockEquipment>;
  /** <schema> Weapon fighting style */
  fightingStyle: Teriock.Parameters.Equipment.WeaponFightingStyle;
  /** <derived> Maybe this should be a getter? */
  fightingStyleDescription: string;
  /** <schema> Is the equipment shattered? */
  shattered: boolean;
  /** <derived> Special Rules (Weapon Fighting Style) */
  specialRules: string;
  /** <schema> Presence Tier */
  tier: Teriock.Fields.ModifiableDeterministic;
  /** <schema> Weight (lb) */
  weight: Teriock.Fields.ModifiableNumber;

  get parent(): TeriockEquipment;
}

