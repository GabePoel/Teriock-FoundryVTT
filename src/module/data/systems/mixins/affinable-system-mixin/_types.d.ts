import { PseudoCollection } from "../../../pseudo-documents/collections/_module.mjs";

declare global {
  namespace Teriock.Models {
    export type AffinableSystemData = {
      /** <schema> Affinities */
      affinities: PseudoCollection<Affinity>;
    };
  }
}

export {};
