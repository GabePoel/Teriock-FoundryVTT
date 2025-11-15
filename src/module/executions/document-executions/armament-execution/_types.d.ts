declare global {
  namespace Teriock.Execution {
    export type ArmamentExecutionOptions = DocumentExecutionOptions & {
      crit?: boolean;
      bonusDamage?: string;
      drain?: boolean;
      damage?: boolean;
      wither?: boolean;
      source: TeriockArmament;
    };
  }
}

export {};
