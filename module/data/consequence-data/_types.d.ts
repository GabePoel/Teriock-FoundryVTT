import { EffectChangeData } from "@common/documents/_types.mjs";

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
 * Consequence hacks for different body parts
 */
export interface ConsequenceHacks {
  arm: string[];
  leg: string[];
  body: string[];
  eye: string[];
  ear: string[];
  mouth: string[];
  nose: string[];
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

declare module "./consequence.mjs" {
  /**
   * A single consequence with instant and ongoing effects
   */
  export default interface Consequence {
    instant: {
      rolls: Partial<ConsequenceRolls>;
      hacks: Partial<ConsequenceHacks>;
    };
    ongoing: {
      statuses: string[];
      changes: EffectChangeData[];
      duration: number | null;
      expirations: ConsequenceExpirations;
    };
  }
}
