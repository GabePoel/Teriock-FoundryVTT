import type { EvaluationModel } from "../../../../models/_module.mjs";

export default interface EquipmentDamagePartInterface
  extends Teriock.Models.ArmamentDataMixinInterface {
  /** <schema> Damage Dice */
  damage: {
    /** <schema> Damage this always deals */
    base: EvaluationModel & {
      typed: string;
    };
    /** <schema> Damage this deals in two hands */
    twoHanded: EvaluationModel & {
      typed: string;
    };
    /** <schema> Additional damage types to be added to all the base damage */
    types: Set<string>;
  };
}
