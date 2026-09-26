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

    /** Suggestions for an identifier input. `true` pulls names from {@link IdentifiersRegistry}. */
    export type IdentifierSuggestions =
      | (() => Record<string, string> | string[])
      | true
      | Record<string, string>
      | string[];

    export type _IdentifierFieldOptions = {
      reset?: string | null;
      suggestions?: IdentifierSuggestions | null;
      type?: string | null;
      validateChoices?: boolean;
    };

    export type _TypedIdentifierFieldOptions = {
      single?: boolean;
      suggestions?: IdentifierSuggestions | null;
      types?: string[];
    };

    /**
     * A single group that will be given the corresponding label in a generated `<select>` element.
     * @see {DynamicChoices}
     */
    export type DynamicChoiceGroup = {
      alwaysAvailable?: boolean;
      choices: Record<string, string>;
      granted?: boolean;
      label: string;
      /** Only mechanics whose own document is the trigger's source respond. */
      self?: boolean;
    };

    /**
     * Select options will be built from dynamic choices. The key for each choice group will be used as that group's
     * value in the generated `<select>` element. Every choice within that {@link DynamicChoiceGroup} will be part of
     * the group designated by its key.
     */
    export type DynamicChoices = Record<string, DynamicChoiceGroup>;

    /**
     * Configuration passed down the `getEditor`/`_getEditorForms`/`_makeFormGroup` chain.
     */
    export type EditorConfig = {
      /** A per-window-unique id used to namespace generated form group ids. */
      rootId?: string;
    };

    export type BarField = { max: number, min: number, value: number };
  }
}

export {};
