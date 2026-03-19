import { CompetenceModel } from "../../../models/_module.mjs";

declare global {
  namespace Teriock.Models {
    export type UsableDataData = {
      /** <schema> Competence */
      competence: CompetenceModel;
    };
  }
}
