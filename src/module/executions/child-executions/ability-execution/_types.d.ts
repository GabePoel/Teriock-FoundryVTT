declare module "./ability-execution.mjs" {
  export default interface AbilityExecution {
    autoPayCosts: boolean;
    bv: number;
    consumeEquipment: boolean;
    noHeighten: boolean;
    preventAttack: boolean;
    preventBlockCone: boolean;
    preventFeat: boolean;
    preventThreshold: boolean;
    usesReaction: boolean;
  }
}

export {};
