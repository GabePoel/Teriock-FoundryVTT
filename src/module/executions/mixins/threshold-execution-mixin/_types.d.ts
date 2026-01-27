declare global {
  namespace Teriock.Execution {
    export type ThresholdExecutionOptions =
      Teriock.Execution.BaseExecutionOptions & {
        advantage?: boolean;
        disadvantage?: boolean;
        threshold?: number;
        bonus?: number | string;
        comparison?: string;
      };
  }
}

export {};
