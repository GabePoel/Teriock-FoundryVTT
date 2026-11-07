import { CompetenceModel } from "../../_module.mjs";

declare module "./base-modifier-model.mjs" {
  export default interface BaseModifierModel {
    /** <schema> Formula part of mod */
    base: Teriock.System.FormulaString;
    /** <schema> Bonus formula */
    bonus: Teriock.System.FormulaString;
    /** <schema> The competence for this modifier */
    competence: CompetenceModel;
    /** <schema> The canonical score number */
    score: number;
  }
}

export {};
