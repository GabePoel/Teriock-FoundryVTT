import { EvaluationModel } from "../../../models/_module.mjs";

declare global {
  namespace Teriock.Models {
    export interface AttunableSystemInterface {
      /** <schema> If this is equipment, it may be identified */
      identified?: boolean;
      /** <schema> If this is equipment, there may be an identification reference */
      reference?: UUID<TeriockEquipment>;
      /** <schema> Presence Tier */
      tier: EvaluationModel;
    }
  }
}
