declare global {
  namespace Teriock.Execution {
    export type ArmamentExecutionOptions = ExecutionOptions & {
      bonus?: Teriock.System.FormulaString;
      source?: TeriockArmament;
    };

    export interface ArmamentExecutionInterface {
      get source(): TeriockArmament;
    }
  }
}

export {};
