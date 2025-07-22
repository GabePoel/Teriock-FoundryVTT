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
  /** Success Threshold */
  threshold?: number;
};

/**
 * Options for performing an equipment roll.
 */
export type EquipmentRollOptions = {
  /** Should this deal two-handed damage? */
  twoHanded?: boolean;
  /** Bonus damage that should be added */
  bonusDamage?: string;
  /** Should this hide information about the equipment? */
  secret?: boolean;
  /** Should this be a crit? */
  advantage?: boolean;
  /** Override the default roll formula */
  formula?: string;
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
 * Options for modifying the behavior of a roll that can crit.
 */
export type CritRollOptions = {
  /** Go critical? */
  crit?: boolean;
}

/**
 * Allowable dice values.
 */
export type PolyhedralDie = "d4" | "d6" | "d8" | "d10" | "d12" | "d20";
