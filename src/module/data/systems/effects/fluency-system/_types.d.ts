declare global {
  namespace Teriock.Models {
    export type FluencySystemData = {
      /** <schema> Tradecraft field */
      field: TypedIdentifier<"field", Teriock.Keys.Field>;
      /** <schema> Tradecraft */
      tradecraft: TypedIdentifier<"tradecraft", Teriock.Keys.Tradecraft>;

      get parent(): TeriockFluency;
    };
  }
}

export {};
