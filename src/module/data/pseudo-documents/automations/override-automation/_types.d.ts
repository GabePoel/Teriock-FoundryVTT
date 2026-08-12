declare module "./override-automation.mjs" {
  export default interface OverrideAutomation {
    rollBonus: Teriock.System.FormulaString;
    makeEffect: boolean | null;
    makeCritEffect: boolean | null;
    targetsActor: boolean | null;
    targetsArmament: boolean | null;
    preventAttack: boolean;
    preventBlockCone: boolean;
    preventFeat: boolean;
    preventThreshold: boolean;
  }
}

export {};
