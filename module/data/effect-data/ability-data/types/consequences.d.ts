import { EffectChangeData } from "@client/documents/_types.mjs";

/**
 * Valid turn expiration targets
 */
export type TurnExpirationTarget = "target" | "executor" | "every" | "other";
/**
 * Valid turn expiration timing
 */
export type TurnExpirationTiming = "start" | "end" | "other";
/**
 * Valid turn expiration methods
 */
export type TurnExpirationMethod = "roll" | "auto";

/**
 * Consequence rolls for different effect types
 */
export interface ConsequenceRolls {
  damage: string[];
  drain: string[];
  wither: string[];
  heal: string[];
  revitalize: string[];
  setTempHp: string[];
  setTempMp: string[];
  gainTempHp: string[];
  gainTempMp: string[];
  sleep: string[];
  kill: string[];
  other: string[];
}

/**
 * Consequence expiration conditions
 */
export interface ConsequenceExpirations {
  turn: {
    enabled: boolean;
    who: TurnExpirationTarget;
    when: TurnExpirationTiming;
    how: TurnExpirationMethod;
  };
  movement: boolean;
  dawn: boolean;
  sustained: boolean;
}

/**
 * Applies data for different proficiency levels
 */
export interface AppliesData {
  statuses: Set<string>;
  startStatuses: Set<string>;
  endStatuses: Set<string>;
  rolls: ConsequenceRolls;
  hacks: Set<string>;
  changes: EffectChangeData[];
  checks: Set<string>;
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
    macro: string | null;
  };
}
