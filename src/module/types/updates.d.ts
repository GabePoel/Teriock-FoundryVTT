/** Functions that should be skipped. */
export type SkipFunctions = {
  /** Skip `applyEncumbrance()` */
  applyEncumbrance?: boolean;
  /** Skip `prepareTokens()` */
  prepareTokens?: boolean;
  /** Skip `checkDown()` */
  checkDown?: boolean;
  /** Skip `etherealKill()` */
  etherealKill?: boolean;
  /** Skip `checkExpirations()` */
  checkExpirations?: boolean;
};
