declare global {
  namespace Teriock.Models {
    export interface ModifierModelInterface {
      /** <schema> Bonus to add to the score */
      bonus: number;
      /** <schema> The canonical score number */
      score: number;
    }
  }
}

export {};
