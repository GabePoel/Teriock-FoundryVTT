declare global {
  namespace Teriock.Execution {
    export interface CommandsExecutionData {
      boosts: number;
      crit: boolean;
      deboosts: number;
      formula: Teriock.System.FormulaString;
      commands: Set<Teriock.Keys.Command>;
    }
  }
}

export {};
