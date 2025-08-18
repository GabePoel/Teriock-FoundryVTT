import TeriockBaseItemData from "../base-item-data/base-item-data.mjs";
import type { TeriockSpecies } from "../../../documents/_documents.mjs";
import type { StatDataInterface } from "../../mixins/_types";

declare module "./species-data.mjs" {
  export default interface TeriockSpeciesData
    extends TeriockBaseItemData,
      StatDataInterface {
    appearance: string;
    size: {
      min: number;
      max: number;
      value: number;
    };
    adult: number;
    lifespan: number | null;
    /** Add this HP to parent {@link TeriockActor}. */
    applyHp: boolean;
    /** Add this MP to parent {@link TeriockActor}. */
    applyMp: boolean;
    /** Apply this size to parent {@link TeriockActor}. */
    applySize: boolean;
    traits: Set<Teriock.Parameters.Species.Trait>;

    get parent(): typeof TeriockSpecies;
  }
}
