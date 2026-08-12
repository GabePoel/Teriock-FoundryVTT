declare module "./base-affinity.mjs" {
  export default interface BaseAffinity {
    _id: ID<BaseAffinity>;
    type: AffinityType;
    category: Teriock.Keys.AffinityCategory;
    value: string;
    img: string;
  }
}

export {};
