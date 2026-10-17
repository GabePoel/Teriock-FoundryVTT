import { InitiativeModel, PiercingModel } from "../../../../../models/_module.mjs";

declare global {
  namespace Teriock.Models {
    export interface ActorCombatPartData {
      /** <base> Defense */
      defense: {
        /** <schema> Armor class (av + 10 unless set) */
        ac: number;
        /** <base> Armor value */
        av: {
          /** <base> Base worn armor value */
          base: number;
          /** <base> Natural armor value */
          natural: number;
          /** <derived> Armor value */
          value: number;
          /** <derived> Worn armor value */
          worn: number;
        };
        /** <schema> Block value of primary blocker unless set */
        bv: number;
        /** <derived> Combat class (ac + bv) */
        cc: number;
      };
      /** <schema> Initiative */
      initiative: InitiativeModel;
      /** <schema> Offense */
      offense: {
        /** <schema> Piercing type */
        piercing: PiercingModel;
        /** <schema> Style bonus */
        sb: boolean;
      };
      /** <schema> Wielding */
      wielding: {
        /** <schema> Primary attacker ID */
        attacker: TeriockItem<"body" | "equipment"> | null;
        /** <schema> Primary blocker ID */
        blocker: TeriockItem<"body" | "equipment"> | null;
      };
    }
  }
}

export {};
