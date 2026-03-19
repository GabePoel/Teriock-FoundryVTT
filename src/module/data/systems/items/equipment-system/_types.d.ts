import "./parts/_types";

declare global {
  namespace Teriock.Models {
    export type EquipmentSystemData = {
      /** <schema> Equipment Classes */
      equipmentClasses: Set<Teriock.Keys.EquipmentClass>;
      /** <schema> Canonical Equipment Type */
      equipmentType: string;
      /** <schema> Power Level */
      powerLevel: Teriock.Keys.PowerLevel;
      /** <schema> Price */
      price: number;

      get parent(): TeriockEquipment;
    };
  }
}
