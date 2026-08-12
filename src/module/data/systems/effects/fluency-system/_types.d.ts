declare module "./fluency-system.mjs" {
  export default interface FluencySystem {
    /** <schema> Tradecraft field */
    field: TypedIdentifier<"field", Teriock.Keys.Field>;
    /** <schema> Tradecraft */
    tradecraft: TypedIdentifier<"tradecraft", Teriock.Keys.Tradecraft>;
  }
}

export {};
