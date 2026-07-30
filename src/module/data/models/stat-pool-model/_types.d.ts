declare global {
  namespace Teriock.Models {
    export type StatPoolModelData = { disabled: boolean, formula: Teriock.System.FormulaString, spent: Set<number> };
  }
}

export {};
