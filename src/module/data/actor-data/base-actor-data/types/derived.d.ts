import { SheetData } from "./sheet";
import type TeriockMacro from "../../../../documents/macro.mjs";
import type TeriockToken from "../../../../documents/token.mjs";

/**
 * Derived data properties.
 */
export interface TeriockBaseActorDerived {
  // Size and encumbrance
  /** The calculated encumbrance level (0-3) based on carried weight vs capacity @derived */
  encumbranceLevel: number;
  /** The named size category (Tiny, Small, Medium, Large, Huge, Gargantuan, Colossal) @derived */
  namedSize: string;

  // Level-based bonuses
  /** Presence bonus derived from level @derived */
  pres: number;
  /** Total rank derived from level @derived */
  rank: number;
  /** Proficiency bonus derived from level @derived */
  p: number;
  /** Fluency bonus derived from level @derived */
  f: number;

  // Presence management
  /** Used presence points @derived */
  usp: number;
  /** Unused presence points @derived */
  unp: number;

  // Combat calculations
  /** Armor value (highest of equipped armor or natural armor) @derived */
  av: number;
  /** Block value from primary blocker @derived */
  bv: number;
  /** Armor class (10 + av + wornAc if wearing armor) @derived */
  ac: number;
  /** Combat class (ac + bv) @derived */
  cc: number;
  /** Whether the actor is wearing armor @derived */
  hasArmor: boolean;

  // Load and weight
  /** Total weight carried by the actor @derived */
  weightCarried: number;
  /** Weight of carried money @derived */
  moneyWeight: number;

  // Enhanced sheet data
  sheet: SheetData & {
    /** Die box display for hit and mana dice */
    dieBox: {
      /** Hit Dice @derived */
      hitDice: string;
      /** Mana Dice @derived */
      manaDice: string;
    };
  };

  // Ability maintenance
  /** Ability flags */
  abilityFlags: Record<string, string>;
  /** Registered pseudo-hook macros to fire */
  hookedMacros: Record<Teriock.PseudoHook, Teriock.UUID<TeriockMacro>[]>;
  /** Species */
  species: Set<string>;
  /** Lighted to */
  lightedTo: Teriock.UUID<TeriockToken>[];
  /** Goaded to */
  goadedTo: Teriock.UUID<TeriockToken>[];
}
