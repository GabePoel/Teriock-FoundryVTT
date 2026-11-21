import { ArmamentRangeUnitModel, DefenseModel } from "../../../models/_module.mjs";

declare global {
  namespace Teriock.Models {
    export interface ArmamentSystemData {
      /** <schema> Armor Value */
      av: DefenseModel;
      /** <schema> Block Value */
      bv: DefenseModel;
      /** <schema> Damage Dice */
      damage: {
        /** <schema> The amount of damage this typically deals */
        base: Teriock.System.FormulaString;
        /** <schema> The amount of damage this deals in two hands */
        twoHanded: Teriock.System.FormulaString;
        /** <base> Additional damage types that will be added to damage this deals */
        types: Set<Slug>;
      };
      /** <schema> Equipment Classes */
      equipmentClasses: Set<Teriock.Keys.Classification>;
      /** <schema> Flaws */
      flaws: string;
      /** <schema> The commands this deals */
      commands: Set<Teriock.Keys.Command>;
      /** <schema> Range */
      range: {
        /** <schema> Long range (this is the default range) */
        long: ArmamentRangeUnitModel;
        /** <schema> Reach added to the user's reach for melee attacks */
        reach: ArmamentRangeUnitModel;
        /** <schema> Short range */
        short: ArmamentRangeUnitModel;
      };
      /** <schema> Per-document behavior and display settings */
      settings: Teriock.Models.DocumentSettingsModelInstance<"armament">;
      /** <schema> Spell Turning */
      spellTurning: boolean;
      /** <schema> Fighting style */
      style: Teriock.Keys.Style;
      /** <derived> Special Rules (Weapon Fighting Style) */
      styleDescription: string;
      /** <schema> Vitals */
      vitals: boolean;
    }
  }
}

export {};
