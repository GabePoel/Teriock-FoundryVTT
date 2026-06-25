import { TypeCollection } from "../../../../documents/collections/_module.mjs";

declare global {
  namespace Teriock.Models {
    export type ExpirableSystemData = {
      /** <schema> Expirations */
      expirations: TypeCollection<ID<Teriock.Expirations.Any>, Teriock.Expirations.Any>;
    };
  }
}
