import { SheetData } from "./sheet";

/**
 * Derived data properties.
 */
export interface TeriockBaseActorDerived {
  // Size and encumbrance
  /** The calculated encumbrance level (0-3) based on carried weight vs capacity */
  encumbranceLevel: number;
  /** The named size category (Tiny, Small, Medium, Large, Huge, Gargantuan, Colossal) */
  namedSize: string;

  // Level-based bonuses
  /** Presence bonus derived from level */
  pres: number;
  /** Total rank derived from level */
  rank: number;
  /** Proficiency bonus derived from level */
  p: number;
  /** Fluency bonus derived from level */
  f: number;

  // Attribute saves (base attribute + bonus)
  /** Intelligence save value */
  intSave: number;
  /** Movement save value */
  movSave: number;
  /** Perception save value */
  perSave: number;
  /** Sneak save value */
  snkSave: number;
  /** Strength save value */
  strSave: number;
  /** Unpresence save value */
  unpSave: number;

  // Presence management
  /** Used presence points */
  usp: number;
  /** Unused presence points */
  unp: number;

  // Combat calculations
  /** Armor value (highest of equipped armor or natural armor) */
  av: number;
  /** Block value from primary blocker */
  bv: number;
  /** Armor class (10 + av + wornAc if wearing armor) */
  ac: number;
  /** Combat class (ac + bv) */
  cc: number;
  /** Whether the actor is wearing armor */
  hasArmor: boolean;

  // Load and weight
  /** Total weight carried by the actor */
  weightCarried: number;
  /** Weight of carried money */
  moneyWeight: number;

  // Enhanced sheet data
  sheet: SheetData & {
    /** Die box display for hit and mana dice */
    dieBox: {
      hitDice: string;
      manaDice: string;
    };
  };
}
