declare global {
  namespace Teriock.Execution {
    export type ThresholdExecutionData = {
      bonus: Teriock.System.FormulaString;
      comparison: Teriock.Keys.Comparison;
      edge: number;
    };
  }
}

export {};
