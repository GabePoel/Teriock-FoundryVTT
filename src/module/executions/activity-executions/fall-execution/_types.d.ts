declare module "./fall-execution.mjs" {
  export default interface FallExecution {
    damageTypes: Set<Identifier<"damage">>;
    distance: number;
    water: boolean;
  }
}

export {};
