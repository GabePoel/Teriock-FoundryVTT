export default interface ActorDeathBagPartInterface {
  /** <schema> Death Bag */
  deathBag: {
    /** <schema> How many stones to pull from the Death Bag */
    pull: string;
    /** <schema> The colors of stones in the Death Bag */
    stones: {
      /** <schema> Black */
      black: string;
      /** <schema> Red */
      red: string;
      /** <schema> White */
      white: string;
    };
  };
}
