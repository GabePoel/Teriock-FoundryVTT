import { CompetenceModel } from "../../models/_module.mjs";

declare global {
  namespace Teriock.Models {
    export interface UsableMixinInterface {
      /** <schema> Competence */
      competence: CompetenceModel;
    }
  }
}

export {};
