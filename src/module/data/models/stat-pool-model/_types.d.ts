declare global {
  namespace Teriock.Models {
    export type StatPoolModelData = {
      disabled: boolean;
      formula: Teriock.System.FormulaString;
      spent: Set<number>;
      stat: Teriock.Keys.DieStat;
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
