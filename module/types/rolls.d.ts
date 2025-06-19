/**
 * Options for performing a d20 roll.
 *
 * @property advantage - If true, the roll is made with advantage.
 * @property disadvantage - If true, the roll is made with disadvantage.
 */
export type CommonRollOptions = {
  advantage?: boolean;
  disadvantage?: boolean;
};

/**
 * Options for modifying the behavior of a condition (2d4) roll.
 *
 * @property increaseDie - If true, roll 3d4.
 * @property decreaseDie - If true, roll 1d4.
 * @property skip - If true, skips the roll. Automatically removes condition.
 */
export type ConditionRollOptions = {
  increaseDie?: boolean;
  decreaseDie?: boolean;
  skip?: boolean;
};
