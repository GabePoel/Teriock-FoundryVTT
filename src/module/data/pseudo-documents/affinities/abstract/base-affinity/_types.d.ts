declare module "./base-affinity.mjs" {
  export default interface BaseAffinity {
    _id: ID<BaseAffinity>;
    type: AffinityType;
    category: Teriock.Keys.Category;
    value: string;
    img: string;
  }
}

export {};
