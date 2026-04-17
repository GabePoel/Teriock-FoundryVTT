declare global {
  namespace Teriock.Models {
    export type ActorSensesPartData = {
      /** <schema> Detection parameters */
      detection: {
        /** <schema> Hiding based on sneak */
        hiding: number | null;
        /** <schema> Perceiving based on perception */
        perceiving: number | null;
      };
      /** <schema> Senses */
      senses: {
        /** <schema> Blind fighting */
        blind: number;
        /** <schema> Dark vision */
        dark: number;
        /** <schema> Ethereal vision */
        ethereal: number;
        /** <schema> Advanced hearing */
        hearing: number;
        /** <schema> See invisible */
        invisible: number;
        /** <schema> Night vision */
        night: number;
        /** <schema> Advanced sight */
        sight: number;
        /** <schema> Advanced smell */
        smell: number;
        /** <schema> Spectral (ethereal lighting) */
        spectral: number;
        /** <schema> True sight */
        truth: number;
      };
    };
  }
}

export {};
