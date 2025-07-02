/**
 * Overview text for different proficiency levels
 */
export interface OverviewText {
  base: string;
  proficient: string;
  fluent: string;
}

/**
 * Results text for different outcomes
 */
export interface ResultsText {
  hit: string;
  critHit: string;
  miss: string;
  critMiss: string;
  save: string;
  critSave: string;
  fail: string;
  critFail: string;
}
