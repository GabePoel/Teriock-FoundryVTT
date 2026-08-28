import { CompetenceModel } from "../../../models/scaling-models/_module.mjs";

declare global {
  namespace Teriock.PseudoDocuments {
    export interface OverrideCompetenceMechanicData {
      competence: CompetenceModel;
      setCompetence: "" | "inherit" | "override";
    }
  }
}

export {};
