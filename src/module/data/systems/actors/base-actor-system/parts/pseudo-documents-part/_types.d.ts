import { PseudoCollection } from "../../../../../pseudo-documents/collections/_module.mjs";

declare global {
  namespace Teriock.Models {
    export interface ActorPseudoDocumentsPartData {
      automations: PseudoCollection<Automation>;
      affinities: PseudoCollection<Affinity>;
      expirations: PseudoCollection<Expiration>;
    }
  }
}

export {};
