import "./parts/_types";
import "./_parameters";

declare global {
  namespace Teriock.Models {
    export type EquipmentSystemInterface = {
      /** <schema> Equipment Classes */
      equipmentClasses: Set<Teriock.Parameters.Equipment.EquipmentClass>;
      /** <schema> Canonical Equipment Type */
      equipmentType: string;
      /** <schema> Power Level */
      powerLevel: Teriock.Parameters.Equipment.EquipmentPowerLevel;
      /** <schema> Price */
      price: number;

      get parent(): TeriockEquipment;
    };
  }
}
