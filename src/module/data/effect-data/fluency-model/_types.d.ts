declare module "./fluency-model.mjs" {
  export default interface TeriockFluencyModel {
    /** <schema> Tradecraft field */
    field: Teriock.Parameters.Fluency.Field;
    /** <schema> Tradecraft */
    tradecraft: Teriock.Parameters.Fluency.Tradecraft;

    get parent(): TeriockFluency;
  }
}

export {};
