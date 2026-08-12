declare module "./roll-activation.mjs" {
  export default interface RollActivation {
    impact: Teriock.Keys.Impact;
    formula: Teriock.System.FormulaString;
    boosts: number;
  }
}

export {};
