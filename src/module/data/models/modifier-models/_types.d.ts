declare global {
  namespace Teriock.Models {
    export type BaseModifierModelData = {
      /** <base> Some key corresponding to the modifier */
      _key: string;
      /** <schema> Bonus formula */
      bonus: Teriock.System.FormulaString;
      /** <schema> The canonical score number */
      score: number;
    };
  }
}

export {};
