import { DamageModel } from "../../../../models/_module.mjs";

export default interface EquipmentDamagePartInterface
  extends Teriock.Models.ArmamentDataMixinInterface {
  /** <schema> Damage Dice */
  damage: {
    /** <schema> Damage this always deals */
    base: DamageModel;
    /** <schema> Damage this deals in two hands */
    twoHanded: DamageModel;
    /** <schema> Additional damage types to be added to all the base damage */
    types: Set<string>;
  };
}
