import type TeriockRegionDocument from "./region-document.mjs";
import { TeriockScene } from "../_module.mjs";

declare global {
  namespace Teriock.Documents {
    export interface RegionDocumentInterface {
      _id: ID<TeriockRegionDocument>;

      get parent(): TeriockScene;
    }
  }
}
