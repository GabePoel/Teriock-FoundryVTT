import { TypeCollection } from "../../../../documents/collections/_module.mjs";
import { BaseActivation } from "../../../pseudo-documents/activations/abstract/_module.mjs";

declare global {
  namespace Teriock.Models {
    export type ActivatableSystemData = {
      /** <schema> Automations */
      activations: TypeCollection<ID<BaseActivation>, BaseActivation>;
    };
  }
}
