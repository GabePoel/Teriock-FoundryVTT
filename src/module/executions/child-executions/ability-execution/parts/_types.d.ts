declare global {
  namespace Teriock.Execution {
    export type AbilityExecutionOptions = AttackExecutionOptions & {
      noGp?: boolean;
      noHeighten?: boolean;
      noHp?: boolean;
      noLp?: boolean;
      noMp?: boolean;
      source?: TeriockAbility;
    };
  }
}

export {};
