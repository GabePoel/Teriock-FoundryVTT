import { TeriockScene } from "../_module.mjs";
import TeriockRegionDocument from "./region-document.mjs";

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
