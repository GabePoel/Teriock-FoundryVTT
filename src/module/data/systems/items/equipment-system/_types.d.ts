declare module "./equipment-system.mjs" {
  export default interface EquipmentSystem {
    /** <schema> Appearance */
    appearance: string;
    /** <schema> Canonical Equipment Type */
    equipmentType: TypedIdentifier<"equipment">;
  }
}

export {};
