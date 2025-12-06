import { ArmamentDataMixinInterface } from "../../mixins/armament-data-mixin/_types";
import {
  EvaluationModel,
  IdentificationModel,
  StorageModel,
} from "../../models/_module.mjs";

declare module "./equipment-model.mjs" {
  export default interface TeriockEquipmentModel
    extends ArmamentDataMixinInterface {
    /** <schema> Container schema */
    storage: StorageModel;
    /** <schema> Damage Dice */
    damage: {
      /** <schema> Damage this always deals */
      base: EvaluationModel;
      /** <schema> Damage this deals in two hands */
      twoHanded: EvaluationModel;
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
    /** <schema.> Identification info */
    identification: IdentificationModel;
    /** <schema> Minimum STR */
    minStr: EvaluationModel;
    /** <schema> Power Level */
    powerLevel: Teriock.Parameters.Equipment.EquipmentPowerLevel;
    /** <schema> Price */
    price: number;
    /** <schema> Is the equipment shattered? */
    shattered: boolean;
    /** <schema> Weight (lb) */
    weight: EvaluationModel & {
      /** <special> Weight times quantity */
      total: number;
    };

    get parent(): TeriockEquipment;
  }
}

export {};
