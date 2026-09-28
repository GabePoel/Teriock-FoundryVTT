declare module "./fall-execution.mjs" {
  export default interface FallExecution {
    damageTypes: Set<TypedIdentifier<"damage">>;
    distance: number;
    water: boolean;
  }
}

export {};
