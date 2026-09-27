import { fromIdentifier, fromIdentifierSync } from "./helpers/utils.mjs";

declare global {
  const TERIOCK: typeof import("./constants/_module.mjs");

  const teriock: {
    applications: typeof import("./applications/_module.mjs");
    canvas: typeof import("./canvas/_module.mjs");
    data: typeof import("./data/_module.mjs");
    dice: typeof import("./dice/_module.mjs");
    documents: typeof import("./documents/_module.mjs");
    executions: typeof import("./executions/_module.mjs");
    fromIdentifier: typeof fromIdentifier;
    fromIdentifierSync: typeof fromIdentifierSync;
    helpers: typeof import("./helpers/_module.mjs");
  };

  const __brand: unique symbol;

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

export {};
