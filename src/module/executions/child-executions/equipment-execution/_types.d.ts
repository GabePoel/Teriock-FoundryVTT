declare module "./equipment-execution.mjs" {
  export default interface EquipmentExecution {
    consumeAmmunition: boolean;
    inheritAmmunitionDamageTypes: boolean;

    ammunition: TeriockItem<"equipment"> | null | undefined;

    get source(): TeriockItem<"equipment">;
  }
}

export {};
