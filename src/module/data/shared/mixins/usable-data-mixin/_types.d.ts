import { CompetenceModel } from "../../../models/_module.mjs";

declare global {
  namespace Teriock.Models {
    export interface UsableDataInterface {
      /** <schema> Competence */
      competence: CompetenceModel;
    }
  }
}
