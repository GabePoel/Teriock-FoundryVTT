import { EvaluationModel } from "../../../models/_module.mjs";

declare global {
  namespace Teriock.Models {
    export type AttunableSystemInterface = {
      /** <schema> If this is equipment, it may be identified */
      reference?: UUID<TeriockEquipment>;
      /** <schema> Presence Tier */
      tier: EvaluationModel;
    };
  }
}
