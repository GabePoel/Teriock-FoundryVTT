import { CompetenceModel } from "../data/models/_module.mjs";

declare global {
  export namespace Teriock.Modifier {
    export type ModifierComponents = {
      base: Teriock.System.FormulaString;
      bonus: Teriock.System.FormulaString;
      circumstance: Teriock.System.FormulaString;
      competence: CompetenceModel;
      die: string;
      edge: number;
      multiplier: number;
      score: number;
      term: Teriock.System.FormulaString;
    };

    export type ModifierFormulaType = "formula" | "mod" | "rollable";

    export type ModifierFormulaFormat = "numbers" | "terms";
  }
}

export {};
