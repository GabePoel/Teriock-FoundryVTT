import { EvaluationModel } from "../../../abstract/_module.mjs";

declare global {
  namespace Teriock.Models {
    export type AttunableSystemData = {
      /** <schema> If this requires attunement */
      needsAttunement: boolean;
      /** <schema> Presence Tier */
      tier: EvaluationModel;
    };
  }
}
