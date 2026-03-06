import { DamageModel } from "../../../../../models/_module.mjs";

export type EquipmentDamagePartInterface = {
  /** <schema> Damage Dice */
  damage: Teriock.Models.ArmamentDamage & {
    /** <schema> Damage this deals in two hands */
    twoHanded: DamageModel;
  };
};
