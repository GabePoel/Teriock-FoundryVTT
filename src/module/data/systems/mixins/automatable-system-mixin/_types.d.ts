import { PseudoCollection } from "../../../pseudo-documents/collections/_module.mjs";

declare global {
  namespace Teriock.Models {
    export type AutomatableSystemData = {
      /** <schema> Automations */
      automations: PseudoCollection<Automation>;
    };
  }
}

export {};
