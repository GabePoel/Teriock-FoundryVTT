import { CompetenceModel } from "../../../models/_module.mjs";

declare global {
  namespace Teriock.Models {
    export type UsableDataInterface = {
      /** <schema> Competence */
      competence: CompetenceModel;
    };
  }
}
