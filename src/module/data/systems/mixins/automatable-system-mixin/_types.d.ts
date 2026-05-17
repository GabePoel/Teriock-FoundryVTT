import { TypeCollection } from "../../../../documents/collections/_module.mjs";

declare global {
  namespace Teriock.Models {
    export type AutomatableSystemData = {
      /** <schema> Automations */
      automations: TypeCollection<ID<Teriock.Automations.Any>, Teriock.Automations.Any>;
    };
  }
}
