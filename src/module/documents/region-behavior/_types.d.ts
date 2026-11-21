import { TeriockRegionDocument } from "../_module.mjs";

declare module "./region-behavior.mjs" {
  export default interface TeriockRegionBehavior {
    _id: Readonly<ID<TeriockRegionBehavior>>;

    readonly parent: TeriockRegionDocument;
    get documentName(): "RegionBehavior";
    get id(): ID<TeriockRegionBehavior>;
    get uuid(): UUID<TeriockRegionBehavior>;
  }
}

export {};
