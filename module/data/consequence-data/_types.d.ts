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
