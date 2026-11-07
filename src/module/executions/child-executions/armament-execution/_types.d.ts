declare module "./armament-execution.mjs" {
  export default interface ArmamentExecution {
    dealCommands: boolean;
    secret: boolean;
    twoHanded: boolean;
    useAbilities: boolean;

    get source(): TeriockItem<"body" | "equipment">;
  }
}

export {};
