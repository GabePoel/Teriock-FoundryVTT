import { TypeCollection } from "../../../../documents/collections/_module.mjs";
import { Tracker } from "../../../pseudo-documents/_module.mjs";

declare global {
  namespace Teriock.Models {
    export type TrackableSystemData = {
      /** <schema> Trackers */
      affinities: TypeCollection<ID<Tracker>, Tracker>;
    };
  }
}

export {};
