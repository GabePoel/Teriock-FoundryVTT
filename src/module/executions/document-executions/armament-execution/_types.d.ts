declare global {
  namespace Teriock.Execution {
    export type ArmamentExecutionOptions = DocumentExecutionOptions & {
      bonusDamage?: Teriock.System.FormulaString;
      crit?: boolean;
      deals?: Iterable<Teriock.Keys.RollImpact>;
      source?: TeriockArmament;
    };

    export interface ArmamentExecutionInterface {
      get source(): TeriockArmament;
    }
  }
}

export {};
