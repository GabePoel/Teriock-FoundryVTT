import { TeriockScene } from "../_module.mjs";

declare module "./region-document.mjs" {
  export default interface TeriockRegionDocument {
    _id: Readonly<ID<TeriockRegionDocument>>;

    readonly parent: TeriockScene;
    get documentName(): "Region";
    get id(): ID<TeriockRegionDocument>;
    get uuid(): UUID<TeriockRegionDocument>;
  }
}

export {};
