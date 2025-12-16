import { EvaluationModel } from "../../models/_module.mjs";

declare module "./equipment-model.mjs" {
  export default interface TeriockEquipmentModel {
    /** <schema> Equipment Classes */
    equipmentClasses: Set<Teriock.Parameters.Equipment.EquipmentClass>;
    /** <schema> Canonical Equipment Type */
    equipmentType: string;
    /** <base> Registered pseudo-hook macros to fire */
    hookedMacros: Teriock.Parameters.Equipment.HookedEquipmentMacros;
    /** <schema> Power Level */
    powerLevel: Teriock.Parameters.Equipment.EquipmentPowerLevel;
    /** <schema> Price */
    price: number;
    /** <schema> Weight (lb) */
    weight: EvaluationModel & {
      /** <special> Weight times quantity */
      total: number;
    };

    get parent(): TeriockEquipment;
  }
}

export {};
