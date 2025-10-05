export interface ArmamentDataMixinInterface {
  /** <schema> Armor Value */
  av: Teriock.Fields.ModifiableNumber;
  /** <schema> Block Value */
  bv: Teriock.Fields.ModifiableNumber;
  /** <schema> Damage Dice */
  damage: {
    /** <schema> Damage this always deals */
    base: Teriock.Fields.ModifiableIndeterministic;
    /** <schema> Additional damage types to be added to all the base damage */
    types: Set<string>;
  };
  /** <schema> Style Bonus (Weapon Fighting Style) */
  fightingStyle: Teriock.Parameters.Equipment.WeaponFightingStyle;
  /** <schema> Flaws */
  flaws: string;
  /** <schema> Notes */
  notes: string;
  /** <base> Piercing */
  piercing: {
    /** <base> <special> If the equipment is AV0 */
    av0: boolean;
    /** <base> If the equipment is UB */
    ub: boolean;
  };
  /** <derived> Special Rules (Weapon Fighting Style) */
  specialRules: string;
  /** <schema> Spell Turning */
  spellTurning: boolean;
}
