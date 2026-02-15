declare global {
  namespace Teriock.Execution {
    export type ArmamentExecutionOptions = DocumentExecutionOptions & {
      bonusDamage?: Teriock.System.FormulaString;
      crit?: boolean;
      deals?: Teriock.Parameters.Consequence.RollConsequenceKey[];
      source?: TeriockArmament;
    };

    export interface ArmamentExecutionInterface {
      get source(): TeriockArmament;
    }
  }
}

export {};
