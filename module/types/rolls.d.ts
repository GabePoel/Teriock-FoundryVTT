/**
 * Options for performing a d20 roll.
 */
export type CommonRollOptions = {
  /** Is this roll made with advantage? */
  advantage?: boolean;
  /** Is this roll made with disadvantage? */
  disadvantage?: boolean;
  /** Chat Message HTML */
  message?: string;
};

/**
 * Options for modifying the behavior of a condition (2d4) roll.
 */
export type ConditionRollOptions = {
  /** Roll 3d4? */
  increaseDie?: boolean;
  /** Roll 1d4? */
  decreaseDie?: boolean;
  /** Should the roll be skipped and the condition removed automatically? */
  skip?: boolean;
};

/**
 * Allowable dice values.
 */
export type PolyhedralDie = "d4" | "d6" | "d8" | "d10" | "d12" | "d20";
