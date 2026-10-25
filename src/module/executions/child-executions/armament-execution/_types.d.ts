declare module "./armament-execution.mjs" {
  export default interface ArmamentExecution {
    dealCommands: boolean;
    secret: boolean;
    twoHanded: boolean;
    useAbilities: boolean;

    bonus: Teriock.System.FormulaString;

    get source(): TeriockItem<"body" | "equipment">;
  }
}

export {};
