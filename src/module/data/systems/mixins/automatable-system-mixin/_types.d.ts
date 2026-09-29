import { PseudoCollection } from "../../../pseudo-documents/collections/_module.mjs";

declare global {
  namespace Teriock.Models {
    export interface AutomatableSystemData {
      /** <schema> Automations */
      automations: PseudoCollection<Automation>;
    }
  }
}

export {};
