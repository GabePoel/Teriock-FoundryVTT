export type SizeAbilityStep = {
  gain: Set<string>;
  lose: Set<string>;
};

declare global {
  namespace Teriock.Models {
    export interface TeriockSpeciesModelInterface
      extends Teriock.Models.TeriockBaseItemModelInterface {
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

      get parent(): TeriockSpecies;
    }
  }
}

export {};
