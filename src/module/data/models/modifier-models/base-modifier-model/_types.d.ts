import { CompetenceModel } from "../../scaling-models/_module.mjs";

declare module "./base-modifier-model.mjs" {
  export default interface BaseModifierModel {
    /** <base> Some key corresponding to the modifier */
    _key: string;
    /** <schema> Bonus formula */
    bonus: Teriock.System.FormulaString;
    /** <schema> The competence for this modifier */
    competence: CompetenceModel;
    /** <schema> The canonical score number */
    score: number;
  }
}

export {};
