declare global {
  namespace Teriock.Execution {
    export interface ThresholdExecutionData {
      bonus: Teriock.System.FormulaString;
      comparison: Teriock.Keys.Comparison;
      edge: number;

      threshold: number | undefined;
    }
  }
}

export {};
