export default interface ActorDeathBagPartInterface {
  /** <schema> Death Bag */
  deathBag: {
    /** <schema> How many stones to pull from the Death Bag */
    pull: Teriock.System.FormulaString;
    /** <schema> The colors of stones in the Death Bag */
    stones: {
      /** <schema> Black */
      black: Teriock.System.FormulaString;
      /** <schema> Red */
      red: Teriock.System.FormulaString;
      /** <schema> White */
      white: Teriock.System.FormulaString;
    };
  };
}
