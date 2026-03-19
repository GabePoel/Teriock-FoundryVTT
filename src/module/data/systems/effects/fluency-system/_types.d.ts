declare global {
  namespace Teriock.Models {
    export type FluencySystemData = {
      /** <schema> Tradecraft field */
      field: Teriock.Keys.Field;
      /** <schema> Tradecraft */
      tradecraft: Teriock.Keys.Tradecraft;

      get parent(): TeriockFluency;
    };
  }
}

export {};
