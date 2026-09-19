declare module "./elder-sorcery-execution.mjs" {
  export default interface ElderSorceryExecution {
    bonuses: {
      assistance: Teriock.System.FormulaString;
      effort: Teriock.System.FormulaString;
      experience: Teriock.System.FormulaString;
      other: Teriock.System.FormulaString;
    };
    level: number;
    penalties: {
      metaphysics: Teriock.System.FormulaString;
      other: Teriock.System.FormulaString;
      strain: Teriock.System.FormulaString;
    };
    ratings: { castingCost: number, creationCost: number, incantation: number, intention: number };
  }
}

export {};
