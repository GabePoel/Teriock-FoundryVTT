import type TeriockBaseItemModel from "../base-item-data/base-item-data.mjs";
import type { ImporterDataMixinInterface } from "../../mixins/importer-data-mixin/_types";
import type { StatGiverMixinInterface } from "../../mixins/stat-giver-data-mixin/_types";
import type { TeriockSpecies } from "../../../documents/_documents.mjs";

export type SizeAbilityStep = {
  gain: Set<string>;
  lose: Set<string>;
};

export interface TeriockSpeciesData {
  /** <schema> Age of maturity */
  adult: number;
  /** <schema> Appearance */
  appearance: string;
  /** <schema> Attribute increase */
  attributeIncrease: string;
  /** <schema> Battle rating */
  br: number;
  /** <schema> HP increase */
  hpIncrease: string;
  /** <schema> Innate ranks */
  innateRanks: string;
  /** <schema> Maximum lifespan */
  lifespan: number | null;
  /** <schema> Size constraints */
  size: {
    /** <schema> Enabled */
    enabled: boolean;
    /** <schema> Maximum size */
    max: number;
    /** <schema> Minimum size */
    min: number;
    /** <schema> Size */
    value: number;
  };
  /** <schema> Size adjustments */
  sizeStepAbilities: Record<number, SizeAbilityStep>;
  /** <schema> Size interval to add another HP die at */
  sizeStepHp: number | null;
  /** <schema> Size interval to add another MP die at */
  sizeStepMp: number | null;
  /** <schema> Traits */
  traits: Set<Teriock.Parameters.Species.Trait>;
  /** <schema> Level of transformation this species is */
  transformationLevel: Teriock.Parameters.Shared.TransformationLevel | null;
}

declare module "./species-data.mjs" {
  export default interface TeriockSpeciesModel
    extends TeriockBaseItemModel,
      StatGiverMixinInterface,
      ImporterDataMixinInterface,
      TeriockSpeciesData {
    get parent(): TeriockSpecies;
  }
}
