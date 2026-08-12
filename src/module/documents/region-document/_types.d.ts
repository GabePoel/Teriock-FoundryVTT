declare module "./region-document.mjs" {
  export default interface TeriockRegionDocument {
    _id: Readonly<ID<TeriockRegionDocument>>;

    get documentName(): "Region";
    get id(): ID<TeriockRegionDocument>;
    get uuid(): UUID<TeriockRegionDocument>;
  }
}

export {};
