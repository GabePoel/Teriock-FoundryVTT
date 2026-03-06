export type ActorTransformationPartInterface = {
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
    level: Teriock.Parameters.Shared.TransformationLevel;
  };
};
