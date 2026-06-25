declare global {
  namespace Teriock.Execution {
    export type DeathBagExecutionOptions = DocumentExecutionOptions & {
      pullFormula?: Teriock.System.FormulaString;
      stonesFormulas?: Record<Teriock.Keys.DeathBagStoneColor, Teriock.System.FormulaString>;
    };
  }
}

export {};
