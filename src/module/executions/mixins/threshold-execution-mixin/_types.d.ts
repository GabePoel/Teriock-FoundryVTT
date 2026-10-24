declare global {
  namespace Teriock.Execution {
    export interface ThresholdExecutionData {
      bonus: Teriock.System.FormulaString;
      comparison: Teriock.Keys.Comparison;
      edge: number;
      participants: number;

      mobMembers: TeriockCombatant[];
      threshold: number | undefined;
    }
  }
}

export {};
