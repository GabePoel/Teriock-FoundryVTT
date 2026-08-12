declare module "./typed-identifier-field.mjs" {
  export default interface TypedIdentifierField {
    /** Allowed document type prefixes. */
    types?: string[];
    /** When true, only one identifier may be attached. */
    single?: boolean;
  }
}

export {};
