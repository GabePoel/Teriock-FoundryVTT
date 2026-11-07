declare module "./equipment-execution.mjs" {
  export default interface EquipmentExecution {
    inheritAmmunitionDamageTypes: boolean;

    get source(): TeriockItem<"equipment">;
  }
}

export {};
