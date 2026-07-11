import { ForcedDeletion, ForcedReplacement } from "@common/data/operators.mjs";

declare global {
  const __brand: unique symbol;

  const _del: () => ForcedDeletion;
  const _loc: (stringId: string, data?: object) => string;
  const _replace: (value: never) => ForcedReplacement;

  /** Foundry VTT UUID */
  type UUID<T = unknown> = string & { [__brand]: T };

  /** Foundry VTT ID */
  type ID<T = unknown> = string & { [__brand]: T };

  /** A string that represents a document's identifier. */
  type Identifier = string;

  /** Helper type to convert a string from camelCase to kebab-case. It converts keys to identifiers. */
  type KebabCase<S extends string> = S extends `${infer C}${infer Rest}`
    ? Rest extends Uncapitalize<Rest> ? `${Uncapitalize<C>}${KebabCase<Rest>}` : `${Uncapitalize<C>}-${KebabCase<Rest>}`
    : S;

  /** A string that represents a document's typed identifier. */
  type TypedIdentifier<Type extends string = string, Key extends string = string> = `${KebabCase<Type>}:${KebabCase<
    Key
  >}`;

  /** Safe Teriock UUID */
  type SafeUUID<T = unknown> = string & { [__brand]: T };
}
