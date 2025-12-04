import { comparisons } from "../dice/functions/_module.mjs";

declare global {
  namespace Teriock.Fields {
    export type _FormulaFieldOptions = {
      /** Is this formula deterministic? */
      deterministic?: boolean;
    };

    export type FormulaDerivationOptions = {
      floor?: boolean;
      ceil?: boolean;
      max?: number;
      min?: number;
      blank?: number | string;
      bool?: boolean;
    };

    export type _EvaluationFieldOptions = _FormulaFieldOptions &
      FormulaDerivationOptions;

    /**
     * Valid comparison operations.
     */
    export type ComparisonCheck = keyof typeof comparisons;

    /**
     * Valid change key comparison operations.
     */
    export type SpecialChangeCheck =
      | ComparisonCheck
      | "has"
      | "includes"
      | "exists"
      | "is"
      | "isNot";

    /**
     * Original special change keys are of the format: `![type]__[key]__[operation]__[value]__[originalKey]`
     */
    export type SpecialChange = Teriock.Foundry.EffectChangeData & {
      reference: {
        type: string;
        key: string;
        check: Teriock.Fields.SpecialChangeCheck;
        value: string;
      };
    };
  }
}

export {};
