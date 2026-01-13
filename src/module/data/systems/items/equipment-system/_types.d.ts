import "./parts/_types";
import "./_parameters";
import { EvaluationModel } from "../../../models/_module.mjs";

declare global {
  namespace Teriock.Models {
    export interface EquipmentSystemInterface
      extends Teriock.Models.BaseItemSystemInterface {
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
}
