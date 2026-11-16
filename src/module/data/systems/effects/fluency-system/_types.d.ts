declare module "./fluency-system.mjs" {
  export default interface FluencySystem {
    /** <schema> Tradecraft field */
    field: Teriock.Keys.Field;
    /** <schema> Tradecraft */
    tradecraft: Teriock.Keys.Tradecraft;
  }
}

export {};
