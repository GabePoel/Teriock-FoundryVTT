declare module "./base-affinity.mjs" {
  export default interface BaseAffinity {
    _id: ID<BaseAffinity>;
    type: Teriock.Affinities.Type;
    category: Teriock.Keys.AffinityCategory;
    value: string;
    img: string;
  }
}

export {};
