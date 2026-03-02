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

    /**
     * A single group that will be given the corresponding label in a generated `<select>` element.
     * @see {DynamicChoices}
     */
    export type DynamicChoiceGroup = {
      label: string;
      choices: Record<string, string>;
    };

    /**
     * Select options will be built from dynamic choices. The key for each choice group will be used as that group's
     * value in the generated `<select>` element. Every choice within that {@link DynamicChoiceGroup} will be part of
     * the group designated by its key.
     */
    export type DynamicChoices = Record<string, DynamicChoiceGroup>;
  }
}

export {};
