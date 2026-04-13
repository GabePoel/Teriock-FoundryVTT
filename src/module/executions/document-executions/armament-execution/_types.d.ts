declare global {
  namespace Teriock.Execution {
    export type ArmamentExecutionOptions = DocumentExecutionOptions & {
      bonus?: Teriock.System.FormulaString;
      crit?: boolean;
      impacts?: Iterable<Teriock.Keys.Impact>;
      source?: TeriockArmament;
      twoHanded?: boolean;
    };

    export interface ArmamentExecutionInterface {
      get source(): TeriockArmament;
    }
  }
}

export {};
