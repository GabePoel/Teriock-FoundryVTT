import { PseudoCollection } from "../../../pseudo-documents/collections/_module.mjs";

declare global {
  namespace Teriock.Models {
    export type ActivatableSystemData = {
      /** <schema> Automations */
      activations: PseudoCollection<Activation>;
    };
  }
}

export {};
