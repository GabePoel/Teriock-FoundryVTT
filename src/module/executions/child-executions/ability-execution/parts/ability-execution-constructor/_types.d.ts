declare module "./ability-execution-constructor.mjs" {
  export default interface AbilityExecutionConstructor {
    autoPayCosts: boolean;
    bv: number;
    consumeEquipment: boolean;
    noHeighten: boolean;
    usesReaction: boolean;
  }
}

export {};
