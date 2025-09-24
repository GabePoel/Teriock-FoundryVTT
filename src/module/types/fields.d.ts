declare global {
  namespace Teriock.Fields {
    export type _FormulaFieldOptions = {
      /** Is this formula deterministic? */
      deterministic?: boolean;
    };

    type Modifiable<T, U> = {
      /**
       * <schema> Field saved in the database that can safely be changed directly. This should never get modified by
       * {@link TeriockEffect} changes or through any other means other than directly editing the schema.
       */
      saved: T;
      /**
       * <schema> <base> Field that modified via {@link TeriockEffect} changes or other means, but cannot be modified
       * directly. This is saved in the schema so that changes can applied properly, but is actually just a copy of
       * `saved` that gets created during `prepareBaseData()` and then gets altered from there..
       */
      raw: T;
      /**
       * <derived> The actual value that is referenced by the game system. If this is a field that must be continuously
       * referenced, then this must be calculated deterministically. Unless this is a formula, the `value` is identical
       * to `raw`. If this field only needs to be referenced instantaneously, then this does not need to be
       * deterministic.
       */
      value: U;
    };

    /**
     * Modifiable field that is always handled as a number.
     */
    export type ModifiableNumber = Modifiable<number, number>;

    /**
     * Modifiable field that is edited as a formula but evaluates to a number.
     */
    export type ModifiableDeterministic = Modifiable<string, number>;

    /**
     * Modifiable field that does not need to be evaluated deterministically.
     */
    export type ModifiableIndeterministic = Modifiable<string, string>;

    /**
     * Valid change key comparison operations.
     */
    export type SpecialChangeCheck =
      | "eq"
      | "ne"
      | "has"
      | "includes"
      | "gt"
      | "lt"
      | "gte"
      | "lte"
      | "exists";

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
