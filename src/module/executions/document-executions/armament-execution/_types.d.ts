declare global {
  namespace Teriock.Execution {
    export type ArmamentExecutionOptions = DocumentExecutionOptions & {
      bonusDamage?: string;
      crit?: boolean;
      deals?: Teriock.Parameters.Consequence.RollConsequenceKey[];
      source?: TeriockArmament;
      wither?: boolean;
    };

    export interface ArmamentExecutionInterface {
      get source(): TeriockArmament;
    }
  }
}

export {};
