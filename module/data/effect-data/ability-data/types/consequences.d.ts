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

export type EffectChangeData = {
  /** The attribute path in the {@link TeriockActor} or {@link TeriockItem} data which the change modifies */
  key: string;
  /** The value of the change effect */
  value: string;
  /** The modification mode with which the change is applied */
  mode: number;
  /** The priority level with which this change is applied */
  priority: number;
}

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
  checks: Set<string>;
  duration: number;
  changes: EffectChangeData[];
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
