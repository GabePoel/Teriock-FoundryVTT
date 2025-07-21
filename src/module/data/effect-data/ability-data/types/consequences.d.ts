import type TeriockMacro from "../../../../documents/macro.mjs";
import type { CombatExpirationMethod, CombatExpirationTiming } from "../../shared/shared-fields";

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
    who: "target" | "executor" | "everyone";
    what: CombatExpirationMethod;
    when: CombatExpirationTiming;
  };
};

/**
 * Applies data for different proficiency levels
 */
export interface AppliesData {
  statuses: Set<string>;
  startStatuses: Set<string>;
  endStatuses: Set<string>;
  rolls: ConsequenceRolls;
  hacks: Set<Teriock.HackableBodyPart>;
  checks: Set<string>;
  duration: number;
  changes: EffectChangeData[];
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
    macro: Teriock.UUID<TeriockMacro> | null;
  };
}
