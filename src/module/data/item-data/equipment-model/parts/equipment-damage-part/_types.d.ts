import type { EvaluationModel } from "../../../../models/_module.mjs";

export default interface EquipmentDamagePartInterface {
  /** <schema> Damage Dice */
  damage: {
    /** <schema> Damage this always deals */
    base: EvaluationModel;
    /** <schema> Damage this deals in two hands */
    twoHanded: EvaluationModel;
    /** <schema> Additional damage types to be added to all the base damage */
    types: Set<string>;
  };
}
