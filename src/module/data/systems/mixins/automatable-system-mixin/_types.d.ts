import { TypeCollection } from "../../../../documents/collections/_module.mjs";

declare global {
  namespace Teriock.Models {
    export type AutomatableSystemData = {
      /** <schema> Automations */
      automations: TypeCollection<ID<Automation>, Automation>;
    };
  }
}

export {};
