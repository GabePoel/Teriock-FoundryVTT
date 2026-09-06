import { PseudoCollection } from "../../../pseudo-documents/collections/_module.mjs";

declare global {
  namespace Teriock.Models {
    export interface ActivatableSystemData {
      /** <schema> Automations */
      activations: PseudoCollection<Activation>;
    }
  }
}

export {};
