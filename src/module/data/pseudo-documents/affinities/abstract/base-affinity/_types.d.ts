declare module "./base-affinity.mjs" {
  export default interface BaseAffinity {
    _id: ID<BaseAffinity>;
    type: AffinityType;
    category: Teriock.Keys.Category;
    name: string;
    slug: Slug;
    img: string;
  }
}

export {};
