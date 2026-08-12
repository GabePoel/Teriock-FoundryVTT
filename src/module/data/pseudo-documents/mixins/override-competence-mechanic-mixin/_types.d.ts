import { CompetenceModel } from "../../../models/scaling-models/_module.mjs";

declare global {
  namespace Teriock.PseudoDocuments {
    export type OverrideCompetenceMechanicData = {
      competence: CompetenceModel;
      setCompetence: "" | "inherit" | "override";
    };
  }
}

export {};
