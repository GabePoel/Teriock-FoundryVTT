import { TypeCollection } from "../../../../documents/collections/_module.mjs";

declare global {
  namespace Teriock.Models {
    export type AffinableSystemData = {
      /** <schema> Affinities */
      affinities: TypeCollection<ID<AnyAffinity>, AnyAffinity>;
    };
  }
}

export {};
