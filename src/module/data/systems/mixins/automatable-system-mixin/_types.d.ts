import { TypeCollection } from "../../../../documents/collections/_module.mjs";
import { BaseAutomation } from "../../../pseudo-documents/automations/abstract/_module.mjs";

declare global {
  namespace Teriock.Models {
    export type AutomatableSystemInterface = {
      /** <schema> Automations */
      automations: TypeCollection<ID<BaseAutomation>, BaseAutomation>;
    };
  }
}
