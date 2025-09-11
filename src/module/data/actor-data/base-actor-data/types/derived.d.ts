import { SheetData } from "./sheet";
import type TeriockMacro from "../../../../documents/macro.mjs";
import type TeriockTokenDocument from "../../../../documents/token-document.mjs";

/**
 * Derived data properties.
 */
export interface TeriockBaseActorDerived {
  // Ability maintenance
  /** Ability flags */
  abilityFlags: Record<string, string>;
  /** Armor class (10 + av + wornAc if wearing armor) @derived */
  ac: number;
  // Combat calculations
  /** Armor value (highest of equipped armor or natural armor) @derived */
  av: number;
  /** Block value from primary blocker @derived */
  bv: number;
  /** Combat class (ac + bv) @derived */
  cc: number;
  // Size and encumbrance
  /** The calculated encumbrance level (0-3) based on carried weight vs capacity @derived */
  encumbranceLevel: number;
  /** Fluency bonus derived from level @derived */
  f: number;
  /** Goaded to */
  goadedTo: Teriock.UUID<TeriockTokenDocument>[];
  /** Whether the actor is wearing armor @derived */
  hasArmor: boolean;
  /** Registered pseudo-hook macros to fire */
  hookedMacros: Record<Teriock.Parameters.Actor.PseudoHook, Teriock.UUID<TeriockMacro>[]>;
  /** Light */
  light: object;
  /** Lighted to */
  lightedTo: Teriock.UUID<TeriockTokenDocument>[];
  /** Weight of carried money @derived */
  moneyWeight: number;
  /** The named size category (Tiny, Small, Medium, Large, Huge, Gargantuan, Colossal) @derived */
  namedSize: string;
  /** Proficiency bonus derived from level @derived */
  p: number;
  // Level-based bonuses
  /** Presence bonus derived from level @derived */
  pres: number;
  /** Total rank derived from level @derived */
  rank: number;
  // Enhanced sheet data
  sheet: SheetData & {
    /** Die box display for hit and mana dice */
    dieBox: {
      /** Hit Dice @derived */
      hpDice: string;
      /** Mana Dice @derived */
      mpDice: string;
    };
  };
  /** Species */
  species: Set<string>;
  /** Transformation */
  transformation: {
    /** Transformed token art */
    img: string | null;
  };
  /** Unused presence points @derived */
  unp: number;
  // Presence management
  /** Used presence points @derived */
  usp: number;
  // Load and weight
  /** Total weight carried by the actor @derived */
  weightCarried: number;
}
