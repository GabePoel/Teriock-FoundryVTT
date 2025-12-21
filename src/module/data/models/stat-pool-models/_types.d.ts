import { EvaluationModel, StatDieModel } from "../_module.mjs";

declare global {
  namespace Teriock.Models {
    export interface StatPoolModelInterface {
      dice: StatDieModel[];
      disabled: boolean;
      faces: number;
      number: EvaluationModel;
      stat: string;
    }
  }
}

export {};
