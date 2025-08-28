import type TeriockBaseItemData from "../base-item-data/base-item-data.mjs";
import type { TeriockSpecies } from "../../../documents/_documents.mjs";
import type { StatDataMixinInterface } from "../../mixins/stat-data-mixin/_types";

type SizeAdjustment = {
  min: number;
  max: number;
  add: string;
  remove: string;
};

declare module "./species-data.mjs" {
  export default interface TeriockSpeciesData
    extends TeriockBaseItemData,
      StatDataMixinInterface {
    /** Age of maturity */
    adult: number;
    /** Appearance */
    appearance: string;
    /** Add this HP to parent {@link TeriockActor}. */
    applyHp: boolean;
    /** Add this MP to parent {@link TeriockActor}. */
    applyMp: boolean;
    /** Apply this size to parent {@link TeriockActor}. */
    applySize: boolean;
    /** Battle rating */
    br: number;
    /** Innate ranks */
    innateRanks: string;
    /** Maximum lifespan */
    lifespan: number | null;
    /** Size constraints */
    size: {
      /** Maximum size */
      max: number;
      /** Minimum size */
      min: number;
      /** Size */
      value: number;
    };
    /** Size adjustments */
    sizeAdjustments: SizeAdjustment[];
    /** Size interval to add another HP die at */
    sizeStepHp: number | null;
    /** Size interval to add another MP die at */
    sizeStepMp: number | null;
    /** Traits */
    traits: Set<Teriock.Parameters.Species.Trait>;

    get parent(): TeriockSpecies;
  }
}
