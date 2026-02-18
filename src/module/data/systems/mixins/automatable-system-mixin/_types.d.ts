import { TypeCollection } from "../../../../documents/collections/_module.mjs";
import { BaseAutomation } from "../../../pseudo-documents/automations/_module.mjs";

declare global {
  namespace Teriock.Models {
    export interface AutomatableSystemInterface {
      /** <schema> Automations */
      automations: TypeCollection<ID<BaseAutomation>, BaseAutomation>;
    }
  }
}
