import { TypeCollection } from "../../../../documents/collections/_module.mjs";

declare global {
  namespace Teriock.Models {
    export type ActivatableSystemData = {
      /** <schema> Automations */
      activations: TypeCollection<ID<Activation>, Activation>;
    };
  }
}

export {};
