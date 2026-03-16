declare global {
  namespace Teriock.Models {
    export type BaseStatPoolModelInterface = {
      disabled: boolean;
      formula: Teriock.System.FormulaString;
      spent: Set<number>;
    };
  }

  namespace Teriock.Functionality {
    export interface StatProvider {
      /** Prepare all the stat dice this has access to. */
      prepareStatDice(): void;
    }
  }
}

export {};
