declare global {
  namespace Teriock.Execution {
    export type LongRestExecutionOptions = ShortRestExecutionOptions & {
      restoreHp?: boolean;
      restoreHpDice?: boolean;
      restoreMp?: boolean;
      restoreMpDice?: boolean;
    };
  }
}

export {};
