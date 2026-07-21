declare global {
  namespace Teriock.Execution {
    export type AttackExecutionOptions = ExecutionOptions & ThresholdExecutionOptions & {
      armament?: TeriockArmament;
      attackPenalty?: Teriock.System.FormulaString;
      limb?: boolean;
      piercing?: Teriock.System.PiercingLevel;
      sb?: boolean;
      useArmament?: boolean;
      vitals?: boolean;
      warded?: boolean;
    };
  }
}

export {};
