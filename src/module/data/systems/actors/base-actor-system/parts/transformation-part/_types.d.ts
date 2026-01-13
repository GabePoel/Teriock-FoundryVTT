export default interface ActorTransformationPartInterface {
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
    /** <base> */
    suppression: {
      /** <base> Whether to suppress body parts */
      bodyParts: boolean;
      /** <base> Whether to suppress equipment */
      equipment: boolean;
      /** <base> Whether to suppress fluencies */
      fluencies: boolean;
      /** <base> Whether to suppress ranks */
      ranks: boolean;
    };
  };
}
