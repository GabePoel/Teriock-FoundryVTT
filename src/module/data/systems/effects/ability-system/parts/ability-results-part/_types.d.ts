declare global {
  namespace Teriock.Models {
    export interface AbilityResultsPartInterface {
      /** <schema> What this ability does to a target */
      results: ResultsText;
    }
  }
}

/**
 * Results text for different outcomes
 */
export interface ResultsText {
  critFail: string;
  critHit: string;
  critMiss: string;
  critSave: string;
  fail: string;
  hit: string;
  miss: string;
  save: string;
}

export {};
