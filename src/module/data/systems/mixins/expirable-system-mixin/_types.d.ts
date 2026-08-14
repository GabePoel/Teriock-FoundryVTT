import { PseudoCollection } from "../../../pseudo-documents/collections/_module.mjs";

declare global {
  namespace Teriock.Models {
    export type ExpirableSystemData = {
      /** <schema> Expirations */
      expirations: PseudoCollection<Expiration>;
    };
  }
}

export {};
