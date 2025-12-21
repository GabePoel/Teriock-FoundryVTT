import { comparisons } from "../dice/functions/_module.mjs";
import { EvaluationModel } from "../data/models/_module.mjs";

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
      decimals?: number;
      skipRollData?: boolean;
    };

    export type _EvaluationFieldOptions = _FormulaFieldOptions &
      FormulaDerivationOptions & {
        model?: typeof EvaluationModel;
      };

    /**
     * Valid comparison operations.
     */
    export type ComparisonCheck = keyof typeof comparisons;
  }
}

export {};
