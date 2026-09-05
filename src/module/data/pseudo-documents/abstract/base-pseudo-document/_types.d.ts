declare module "./base-pseudo-document.mjs" {
  export default interface BasePseudoDocument {
    _id: ID<BasePseudoDocument>;
    type: string;
  }
}

export {};
