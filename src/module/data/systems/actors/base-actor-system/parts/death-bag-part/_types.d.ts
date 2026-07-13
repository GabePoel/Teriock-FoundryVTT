declare global {
  namespace Teriock.Models {
    export type ActorDeathBagPartData = {
      /** <schema> Death Bag */
      deathBag: {
        /** <schema> How many stones to pull from the Death Bag */
        pull: Teriock.System.FormulaString;
        /** <schema> The colors of stones in the Death Bag */
        stones: Record<Teriock.Keys.DeathBagStoneColor, Teriock.System.FormulaString>;
      };
    };
  }
}

export {};
