declare global {
  namespace Teriock.Models {
    export interface CommonSystemData {
      /** <base> Boosts formulas by roll type */
      boosts: Record<Teriock.Keys.Command, Teriock.System.FormulaString>;
    }
  }
}

export {};
