import { EvaluationModel } from "../../models/_module.mjs";

declare global {
  namespace Teriock.Models {
    export interface ArmamentDataMixinInterface {
      /** <schema> How much this increases an actor's attack penalty by per use */
      attackPenalty: EvaluationModel;
      /** <schema> Armor Value */
      av: EvaluationModel;
      /** <schema> Block Value */
      bv: EvaluationModel;
      /** <schema> Damage Dice */
      damage: {
        /** <schema> Damage this always deals */
        base: EvaluationModel & {
          typed: string;
        };
        /** <schema> Additional damage types to be added to all the base damage */
        types: Set<string>;
      };
      /** <schema> Style Bonus (Weapon Fighting Style) */
      fightingStyle: Teriock.Parameters.Equipment.WeaponFightingStyle;
      /** <schema> Flaws */
      flaws: string;
      /** <schema> Additional Hit Bonus */
      hit: EvaluationModel;
      /** <schema> Notes */
      notes: string;
      /** <base> Piercing */
      piercing: {
        /** <base> <special> If the equipment is AV0 */
        av0: boolean;
        /** <base> If the equipment is UB */
        ub: boolean;
      };
      /** <base> Local property keys that can be modified by changes */
      props: Set<string>;
      /** <schema> Range (ft) (if ranged) */
      range: {
        /** <schema> Long range (this is the default range) */
        long: EvaluationModel;
        /** <schema> Is the equipment melee? */
        melee: boolean;
        /** <schema> Is the equipment ranged? */
        ranged: boolean;
        /** <schema> Short range */
        short: EvaluationModel;
      };
      /** <derived> Special Rules (Weapon Fighting Style) */
      specialRules: string;
      /** <schema> Spell Turning */
      spellTurning: boolean;
      /** <base> Warded */
      warded: boolean;
    }
  }
}
