import "./parts/_types";
import "./_parameters";
import { DamageModel, EvaluationModel } from "../../../models/_module.mjs";

declare global {
  namespace Teriock.Models {
    export interface EquipmentSystemInterface
      extends Teriock.Models.BaseItemSystemInterface {
      damage: Teriock.Models.ArmamentDamage & {
        /** <schema> Damage this deals in two hands */
        twoHanded: DamageModel;
      };
      /** <schema> Equipment Classes */
      equipmentClasses: Set<Teriock.Parameters.Equipment.EquipmentClass>;
      /** <schema> Canonical Equipment Type */
      equipmentType: string;
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
