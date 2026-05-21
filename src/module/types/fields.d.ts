import { EvaluationModel } from "../data/models/_module.mjs";
import { comparisons } from "../dice/functions/_module.mjs";

declare global {
  namespace Teriock.Fields {
    export type _FormulaFieldOptions = {
      /** Is this formula deterministic? */
      deterministic?: boolean;
    };

    export type _MultiChangeFieldOptions = {
      /** Specific paths this should propagate to instead of all direct subfields */
      multiChangePaths?: string[];
    };

    export type _LocalDocumentFieldOptions = {
      /** Display string ID if no matching document is found */
      fallback?: boolean;
      /** Only display the ID and not the full document */
      idOnly?: boolean;
      /** Force to null if the specified condition is met */
      nullify?: (doc: TeriockDocument) => boolean;
    };

    export type FormulaDerivationOptions = {
      blank?: number | string;
      bool?: boolean;
      ceil?: boolean;
      floor?: boolean;
      interval?: number;
      max?: number;
      min?: number;
      skipRollData?: boolean;
    };

    export type _EvaluationFieldOptions = _FormulaFieldOptions &
      FormulaDerivationOptions & {
        model?: typeof EvaluationModel;
      };

    export type _IdentifierFieldOptions = {
      reset?: string | null;
    };

    export type _TypedIdentifierFieldOptions = {
      single?: boolean;
      types?: string[];
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
      choices: Record<string, string>;
      label: string;
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
