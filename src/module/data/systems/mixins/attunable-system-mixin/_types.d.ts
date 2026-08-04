declare global {
  namespace Teriock.Models {
    export type AttunableSystemData = {
      /** <schema> If this requires attunement */
      needsAttunement: boolean;
      /** <schema> Price */
      price: number;
      /** <schema> Presence tier */
      tier: {
        /** <schema> Formula for presence cost */
        raw: Teriock.System.FormulaString;
        /** <derived> Evaluated presence cost */
        value: number;
      };
    };
  }
}

export {};
