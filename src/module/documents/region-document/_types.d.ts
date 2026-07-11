import { TeriockRegionDocument, TeriockScene } from "../_module.mjs";

declare global {
  namespace Teriock.Documents {
    export interface RegionDocumentInterface {
      _id: ID<TeriockRegionDocument>;

      get id(): ID<TeriockRegionDocument>;
      get parent(): TeriockScene;
      get uuid(): UUID<TeriockRegionDocument>;
    }
  }
}
