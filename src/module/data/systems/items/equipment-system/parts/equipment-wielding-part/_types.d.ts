import type { EvaluationModel } from "../../../../../models/_module.mjs";

export default interface EquipmentWieldingPartInterface {
  /** <schema> Is the equipment equipped? */
  equipped: boolean;
  /** <schema> Is the equipment glued? */
  glued: boolean;
  /** <schema> Minimum STR */
  minStr: EvaluationModel;
}
