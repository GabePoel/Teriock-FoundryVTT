import { EvaluationModel, RangeModel } from "../../../models/_module.mjs";

declare global {
  namespace Teriock.Models {
    export type ArmamentSystemData = {
      /** <schema> Armor Value */
      av: EvaluationModel;
      /** <schema> Block Value */
      bv: EvaluationModel;
      /** <schema> Damage Dice */
      damage: {
        /** <schema> The amount of damage this typically deals */
        base: Teriock.System.FormulaString;
        /** <schema> The amount of damage this deals in two hands */
        twoHanded: Teriock.System.FormulaString;
        /** <base> Additional damage types that will be added to damage this deals */
        types: Set<Identifier>;
      };
      /** <schema> Equipment Classes */
      equipmentClasses: Set<Teriock.Keys.EquipmentClass>;
      /** <schema> Style Bonus (Weapon Fighting Style) */
      fightingStyle: Teriock.Keys.WeaponFightingStyle;
      /** <schema> Flaws */
      flaws: string;
      /** <schema> The impacts this deals */
      impacts: Set<Teriock.Keys.Impact>;
      /** <schema> Notes */
      notes: string;
      /** <base> Local property keys that can be modified by changes */
      props: Set<string>;
      /** <schema> Range (ft) (if ranged) */
      range: {
        /** <schema> Long range (this is the default range) */
        long: RangeModel;
        /** <schema> Is the armament melee? */
        melee: boolean;
        /** <schema> Is the armament ranged? */
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
    };
  }
}
