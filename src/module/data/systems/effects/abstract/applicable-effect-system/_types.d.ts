declare module "./applicable-effect-system.mjs" {
  export default interface ApplicableEffectSystem {
    /** <schema> UUID of the document this is sourced from */
    _src: UUID<TeriockActiveEffect<"ability">> | null;
  }
}

export {};
