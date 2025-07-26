/**
 * Valid maneuvers for abilities
 */
export type AbilityManeuver = "active" | "reactive" | "passive" | "slow";

/**
 * Valid execution times for active maneuvers
 */
export type ActiveExecutionTime = "a0" | "a1" | "a2" | "a3";

/**
 * Valid execution times for reactive maneuvers
 */
export type ReactiveExecutionTime = "r0" | "r1";

/**
 * Valid execution times for passive maneuvers
 */
export type PassiveExecutionTime = "passive";

/**
 * Valid execution times for slow maneuvers
 */
export type SlowExecutionTime = "longRest" | "shortRest" | string;

/**
 * Valid execution times
 */
export type ExecutionTime =
  | ActiveExecutionTime
  | ReactiveExecutionTime
  | PassiveExecutionTime
  | SlowExecutionTime;
