declare global {
  namespace Teriock.Models {
    export type AbilityResultsPartData = {
      /** <schema> What this ability does to a target */
      results: {
        critFail: string;
        critHit: string;
        critMiss: string;
        critSave: string;
        fail: string;
        hit: string;
        miss: string;
        save: string;
      };
    };
  }
}

export {};
