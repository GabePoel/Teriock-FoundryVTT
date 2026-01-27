import {
  DamageModel,
  EvaluationModel,
  RangeModel,
} from "../../../models/_module.mjs";

declare global {
  namespace Teriock.Models {
    export type ArmamentDamage = {
      /** <schema> Damage this always deals */
      base: DamageModel;
      /** <schema> Additional damage types to be added to all the base damage */
      types: Set<string>;
    };

    export interface ArmamentSystemInterface {
      /** <schema> How much this increases an actor's attack penalty by per use */
      attackPenalty: EvaluationModel;
      /** <schema> Armor Value */
      av: EvaluationModel;
      /** <schema> Block Value */
      bv: EvaluationModel;
      /** <schema> Damage Dice */
      damage: Teriock.Models.ArmamentDamage;
      /** <schema> Style Bonus (Weapon Fighting Style) */
      fightingStyle: Teriock.Parameters.Equipment.WeaponFightingStyle;
      /** <schema> Flaws */
      flaws: string;
      /** <schema> Additional Hit Bonus */
      hit: EvaluationModel;
      /** <schema> Notes */
      notes: string;
      /** <base> Local property keys that can be modified by changes */
      props: Set<string>;
      /** <schema> Range (ft) (if ranged) */
      range: {
        /** <schema> Long range (this is the default range) */
        long: RangeModel;
        /** <schema> Is the equipment melee? */
        melee: boolean;
        /** <schema> Is the equipment ranged? */
        ranged: boolean;
        /** <schema> Short range */
        short: RangeModel;
        /** <base> Text that summarizes the range */
        description: string;
      };
      /** <derived> Special Rules (Weapon Fighting Style) */
      specialRules: string;
      /** <schema> Spell Turning */
      spellTurning: boolean;
      /** <schema> Vitals */
      vitals: boolean;
      /** <base> Warded */
      warded: boolean;
    }
  }
}
