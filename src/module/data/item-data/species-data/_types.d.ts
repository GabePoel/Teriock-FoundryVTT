import TeriockBaseItemData from "../base-item-data/base-item-data.mjs";
import { TeriockSpecies } from "../../../documents/_documents.mjs";
import type StatDieModel from "../../shared/stat-die.mjs";

declare module "./species-data.mjs" {
  export default interface TeriockSpeciesData extends TeriockBaseItemData {
    parent: TeriockSpecies;
    description: string;
    appearance: string;
    size: {
      min: number;
      max: number;
      value: number;
    };
    hp: {
      /** @base */
      raw: string;
      /** @base */
      value: number;
    };
    mp: {
      /** @base */
      raw: string;
      /** @base */
      value: number;
    };
    applyHp: boolean;
    applyMp: boolean;
    applySize: boolean;
    traits: Set<Teriock.Parameters.Species.Trait>;
    /** Hit Dice */
    hpDice: Record<Teriock.ID<StatDieModel>, StatDieModel>;
    /** Mana Dice */
    mpDice: Record<Teriock.ID<StatDieModel>, StatDieModel>;
  }
}
