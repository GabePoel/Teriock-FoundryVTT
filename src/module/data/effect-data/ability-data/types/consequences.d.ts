import type TeriockMacro from "../../../../documents/macro.mjs";
import type {
  CombatExpirationMethod,
  CombatExpirationSourceType,
  CombatExpirationTiming,
} from "../../shared/shared-fields";
import type { TeriockConsequence } from "../../../../documents/_documents.mjs";

export type EffectChangeData = {
  /** The attribute path in the {@link TeriockActor} or {@link TeriockItem} data which the change modifies */
  key: string;
  /** The value of the change effect */
  value: string;
  /** The modification mode with which the change is applied */
  mode: number;
  /** The priority level with which this change is applied */
  priority: number;
};

/**
 * Consequence rolls for different effect types
 */
export interface ConsequenceRolls {
  damage: string;
  drain: string;
  wither: string;
  heal: string;
  revitalize: string;
  setTempHp: string;
  setTempMp: string;
  gainTempHp: string;
  gainTempMp: string;
  sleep: string;
  kill: string;
  pay: string;
  other: string;
}

/**
 * Ability-specific expiration data.
 */
type AbilityExpiration = {
  combat: {
    who: { type: CombatExpirationSourceType };
    what: CombatExpirationMethod;
    when: CombatExpirationTiming;
  };
};

/**
 * Applies data for different proficiency levels
 */
export interface AppliesData {
  statuses: Set<Teriock.ConditionKey>;
  startStatuses: Set<Teriock.ConditionKey>;
  endStatuses: Set<Teriock.ConditionKey>;
  rolls: ConsequenceRolls;
  hacks: Set<Teriock.HackableBodyPart>;
  checks: Set<Teriock.Tradecraft>;
  duration: number;
  changes: EffectChangeData[];
  standardDamage: boolean;
  expiration: {
    normal: AbilityExpiration;
    crit: AbilityExpiration;
    changeOnCrit: boolean;
    doesExpire: boolean;
  };
}

/**
 * Consequences that are applied to the target.
 */
export interface TeriockAbilityConsequenceSchema {
  applies: {
    base: AppliesData;
    proficient: AppliesData;
    fluent: AppliesData;
    heightened: AppliesData;
    macros: Record<Teriock.SafeUUID<TeriockMacro>, Teriock.PseudoHook>;
  };
  sustaining: Set<Teriock.UUID<TeriockConsequence>>;
}
