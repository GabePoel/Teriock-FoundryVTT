declare module "./roll-activation.mjs" {
  export default interface RollActivation {
    command: Teriock.Keys.Command;
    formula: Teriock.System.FormulaString;
    boosts: number;
  }
}

export {};
