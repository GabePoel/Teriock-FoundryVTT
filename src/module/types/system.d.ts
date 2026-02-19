import {
  abilityPseudoHooks,
  propertyPseudoHooks,
} from "../constants/system/pseudo-hooks.mjs";
import { TeriockMacro } from "../documents/_module.mjs";
import { displayOptions } from "../constants/options/display-options.mjs";

declare global {
  export namespace Teriock.Parameters.Shared {
    export type AbilityPseudoHook = keyof typeof abilityPseudoHooks;
    export type PropertyPseudoHook = keyof typeof propertyPseudoHooks;
    export type PseudoHook = AbilityPseudoHook | PropertyPseudoHook;
    export type MacroHookRecord = Record<
      SafeUUID<TeriockMacro>,
      Teriock.Parameters.Shared.PropertyPseudoHook
    >;
    export type CardDisplaySize = keyof typeof displayOptions.sizes;
  }

  export namespace Teriock.System {
    export type _CreateOperation = {
      /**
       * Allows subs that would be created by other documents to also be created as their own documents in the same
       * database call. May cause odd results.
       */
      allowDuplicateSubs?: boolean;
      /**
       * Since {@link HierarchyDocumentMixin._preCreateDocuments} manipulates the default `keepId` value in creation
       * operations, subsequent operations using the same operation object can get messed up. This allows us to
       * reset it in {@link HierarchyDocument.createDocuments}.
       */
      cachedKeepId?: boolean;
      /** Tracker to see if the value of `cachedKeepId` should be read. */
      isKeepIdCached?: boolean;
      /** Force even subs to keep their `_id`. May cause `_id` collisions. */
      keepSubIds?: boolean;
    };

    /**
     * Something's competency level specifies if it's proficient or fluent.
     * - `0`: Neither proficient nor fluent
     * - `1`: Proficient
     * - `2`: Fluent
     */
    export type CompetenceLevel = 0 | 1 | 2;

    /**
     * Something's piercing level specifies if it's AV0 or UB.
     * - `0`: Neither AV0 nor UB
     * - `1`: AV0
     * - `2`: UB
     */
    export type PiercingLevel = 0 | 1 | 2;

    /**
     * Something's edge level specifies if it has advantage or disadvantage.
     * - `-1`: Disadvantage
     * - `0`: Neither advantage nor disadvantage
     * - `1`: Advantage
     */
    export type EdgeLevel = -1 | 0 | 1;

    /**
     * A string that can be used in a roll formula.
     */
    export type FormulaString = string;

    /**
     * A string that represents an image's file path.
     */
    export type ImageString = string;
  }
}
