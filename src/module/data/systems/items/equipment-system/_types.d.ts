import "./parts/_types";

declare global {
  namespace Teriock.Models {
    export type EquipmentSystemData = {
      /** <schema> Canonical Equipment Type */
      equipmentType: Teriock.System.IdentifierString;
      /** <schema> Power Level */
      powerLevel: Teriock.Keys.PowerLevel;
      /** <schema> Price */
      price: number;

      get parent(): TeriockEquipment;
    };
  }
}
