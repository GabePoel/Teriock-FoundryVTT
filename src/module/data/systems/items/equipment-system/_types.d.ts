declare global {
  namespace Teriock.Models {
    export type EquipmentSystemData = {
      /** <schema> Canonical Equipment Type */
      equipmentType: TypedIdentifier<"equipment">;
      /** <schema> Power Level */
      powerLevel: Teriock.Keys.PowerLevel;

      get parent(): TeriockEquipment;
    };
  }
}

export {};
