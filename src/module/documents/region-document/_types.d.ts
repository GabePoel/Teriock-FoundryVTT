declare module "./region-document.mjs" {
  export default interface TeriockRegionDocument {
    _id: ID<TeriockRegionDocument>;

    get id(): ID<TeriockRegionDocument>;
    get uuid(): UUID<TeriockRegionDocument>;
  }
}

export {};
