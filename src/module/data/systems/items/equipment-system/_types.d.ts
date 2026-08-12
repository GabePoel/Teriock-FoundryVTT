declare module "./equipment-system.mjs" {
  export default interface EquipmentSystem {
    /** <schema> Canonical Equipment Type */
    equipmentType: TypedIdentifier<"equipment">;
  }
}

export {};
