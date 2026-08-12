declare module "./death-bag-execution.mjs" {
  export default interface DeathBagExecution {
    pull: Teriock.System.FormulaString;
    stones: Record<Teriock.Keys.DeathBagStoneColor, Teriock.System.FormulaString>;
  }
}

export {};
