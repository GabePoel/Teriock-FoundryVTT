import { PiercingModel } from "../../../models/_module.mjs";

declare global {
  namespace Teriock.Models {
    export interface AttackSystemData {
      /** <schema> Attack penalty */
      attackPenalty: Teriock.System.FormulaString;
      /** <schema> Hit bonus */
      hitBonus: Teriock.System.FormulaString;
      /** <schema> Piercing */
      piercing: PiercingModel;
      /** <base> Warded */
      warded: boolean;
    }
  }
}

export {};
