declare global {
  namespace Teriock.Execution {
    export type ImpactsExecutionData = {
      boosts: number;
      crit: boolean;
      deboosts: number;
      formula: Teriock.System.FormulaString;
      impacts: Set<Teriock.Keys.Impact>;
    };
  }
}

export {};
