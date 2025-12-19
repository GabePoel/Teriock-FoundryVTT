import { EvaluationModel, StatDieModel } from "../_module.mjs";
import { StatDieData } from "../stat-die-model/_types";

export interface StatPoolTemplate {
  disabled: boolean;
  faces: number;
  number: EvaluationModel;
  stat: string;
}

export interface StatPoolData extends StatPoolTemplate {
  dice: StatDieData[];
}

declare global {
  namespace Teriock.Models {
    export interface StatPoolModelInterface extends StatPoolTemplate {
      dice: StatDieModel[];
    }
  }
}

export {};
