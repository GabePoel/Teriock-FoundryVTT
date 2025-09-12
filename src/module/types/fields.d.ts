declare global {
  namespace Teriock.Fields {
    export type _FormulaFieldOptions = {
      /** Is this formula deterministic? */
      deterministic?: boolean;
    }
  }
}

export {};