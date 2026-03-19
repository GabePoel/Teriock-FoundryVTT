declare global {
  namespace Teriock.Models {
    export type ActorTransformationPartData = {
      /** <base> Transformation */
      transformation: {
        /** <base> Transformed token art */
        image: string | null;
        /** <schema> */
        primary: ID<TeriockConsequence> | null;
        /** <base> */
        effect: TeriockConsequence | null;
        /** <base> */
        species: TeriockSpecies[];
        /** <base> */
        level: Teriock.Keys.TransformationLevel;
      };
    };
  }
}

export {};
