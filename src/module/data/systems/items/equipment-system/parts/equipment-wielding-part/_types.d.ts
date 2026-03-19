import type { EvaluationModel } from "../../../../../models/_module.mjs";

declare global {
  namespace Teriock.Models {
    export type EquipmentWieldingPartData = {
      /** <schema> Is the equipment equipped? */
      equipped: boolean;
      /** <schema> Is the equipment glued? */
      glued: boolean;
      /** <schema> Minimum STR */
      minStr: EvaluationModel;
    };
  }
}

export {};
