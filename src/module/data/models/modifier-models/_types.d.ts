declare global {
  namespace Teriock.Models {
    export type BaseModifierModelData = {
      /** <schema> Bonus to add to the score */
      bonus: number;
      /** <schema> The canonical score number */
      score: number;
    };
  }
}

export {};
