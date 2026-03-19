import { DamageModel } from "../../../../../models/_module.mjs";

declare global {
  namespace Teriock.Models {
    export type EquipmentDamagePartData = {
      /** <schema> Damage Dice */
      damage: Teriock.Models.ArmamentDamage & {
        /** <schema> Damage this deals in two hands */
        twoHanded: DamageModel;
      };
    };
  }
}

export {};
