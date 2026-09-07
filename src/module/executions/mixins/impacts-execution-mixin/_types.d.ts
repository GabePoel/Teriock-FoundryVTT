declare global {
  namespace Teriock.Execution {
    export interface ImpactsExecutionData {
      boosts: number;
      crit: boolean;
      deboosts: number;
      formula: Teriock.System.FormulaString;
      impacts: Set<Teriock.Keys.Impact>;
    }
  }
}

export {};
