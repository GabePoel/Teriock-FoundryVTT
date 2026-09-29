import { PseudoCollection } from "../../../pseudo-documents/collections/_module.mjs";

declare global {
  namespace Teriock.Models {
    export interface AffinableSystemData {
      /** <schema> Affinities */
      affinities: PseudoCollection<Affinity>;
    }
  }
}

export {};
