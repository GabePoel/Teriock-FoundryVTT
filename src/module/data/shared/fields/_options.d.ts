declare global {
  namespace Teriock.Options.Fields {
    export type _FormulaFieldOptions = {
      /** Is this formula deterministic? */
      deterministic: boolean;
    }
  }
}

export {};