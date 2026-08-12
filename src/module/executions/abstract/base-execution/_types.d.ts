import CompetenceModel from "../../../data/models/scaling-models/competence-model/competence-model.mjs";

declare module "./base-execution.mjs" {
  export default interface BaseExecution {
    competence: CompetenceModel;
    formula: Teriock.System.FormulaString;
  }
}

export {};
