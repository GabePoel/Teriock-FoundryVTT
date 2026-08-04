declare global {
  namespace Teriock.Models {
    export type EquipmentSystemData = {
      /** <schema> Canonical Equipment Type */
      equipmentType: TypedIdentifier<"equipment">;

      get parent(): TeriockEquipment;
    };
  }
}

export {};
