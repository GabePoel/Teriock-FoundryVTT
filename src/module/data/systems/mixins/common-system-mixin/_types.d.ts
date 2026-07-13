declare global {
  namespace Teriock.Models {
    export type CommonSystemData = {
      /** <base> Boosts formulas by roll type */
      boosts: Record<Teriock.Keys.Impact, Teriock.System.FormulaString>;

      get parent(): AnyCommonDocument;
    };
  }
}

export {};
