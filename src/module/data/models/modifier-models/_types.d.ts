declare global {
  namespace Teriock.Models {
    export type BaseModifierModelData = {
      /** <base> Some key corresponding to the modifier */
      _key: string;
      /** <schema> Bonus to add to the score */
      bonus: number;
      /** <schema> The canonical score number */
      score: number;
    };
  }
}

export {};
