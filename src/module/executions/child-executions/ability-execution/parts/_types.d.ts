declare global {
  namespace Teriock.Execution {
    export type AbilityExecutionOptions = ExecutionOptions & ThresholdExecutionOptions & {
      armament?: TeriockArmament;
      attackPenalty?: string;
      limb?: boolean;
      noGp?: boolean;
      noHeighten?: boolean;
      noHp?: boolean;
      noLp?: boolean;
      noMp?: boolean;
      piercing?: Teriock.System.PiercingLevel;
      sb?: boolean;
      source?: TeriockAbility;
      vitals?: boolean;
      warded?: boolean;
    };
  }
}

export {};
