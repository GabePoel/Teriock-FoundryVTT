declare global {
  namespace Teriock.Execution {
    export type AbilityExecutionOptions = DocumentExecutionOptions & ThresholdExecutionOptions & {
      armament?: TeriockArmament;
      attackPenalty?: string;
      av0?: boolean;
      limb?: boolean;
      noGp?: boolean;
      noHeighten?: boolean;
      noHp?: boolean;
      noLp?: boolean;
      noMp?: boolean;
      piercing?: Teriock.System.PiercingLevel;
      sb?: boolean;
      source?: TeriockAbility;
      ub?: boolean;
      vitals?: boolean;
      warded?: boolean;
    };
  }
}

export {};
