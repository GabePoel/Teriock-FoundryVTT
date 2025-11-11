import type TeriockBaseItemModel from "../base-item-data/base-item-data.mjs";
import type { TeriockEquipment } from "../../../documents/_documents.mjs";
import type { ExecutableDataMixinInterface } from "../../mixins/executable-data-mixin/_types";
import type { ConsumableDataMixinInterface } from "../../mixins/consumable-data-mixin/_types";
import type { ArmamentDataMixinInterface } from "../../mixins/armament-data-mixin/_types";

declare global {
  interface TeriockEquipmentData
    extends TeriockBaseItemModel,
      ConsumableDataMixinInterface,
      ExecutableDataMixinInterface,
      ArmamentDataMixinInterface {
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
    /** <base> Is the equipment glued? */
    glued: boolean;
    /** <base> Registered pseudo-hook macros to fire */
    hookedMacros: Teriock.Parameters.Equipment.HookedEquipmentMacros;
    /** <schema> Is the equipment identified? */
    identified: boolean;
    /** <schema> Minimum STR */
    minStr: Teriock.Fields.ModifiableNumber;
    /** <schema> Power Level */
    powerLevel: Teriock.Parameters.Equipment.EquipmentPowerLevel;
    /** <schema> Price */
    price: number;
    /** <schema> Identification Reference Equipment UUID */
    reference: Teriock.UUID<TeriockEquipment>;
    /** <schema> Is the equipment shattered? */
    shattered: boolean;
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

declare module "./equipment-data.mjs" {
  export default interface TeriockEquipmentModel extends TeriockEquipmentData {
    get parent(): TeriockEquipment;
  }
}
