declare global {
  namespace Teriock.Models {
    export type SpeciesStatIncreaseFields = { [K in Teriock.Keys.DieStat as `${K}Increase`]: string; };

    export type SpeciesSystemData = SpeciesStatIncreaseFields & SpeciesTransformationPartData & {
      /** <schema> Age of maturity */
      adult: number;
      /** <schema> Appearance */
      appearance: string;
      /** <schema> Attribute increase */
      attributeIncrease: string;
      /** <schema> Battle rating */
      br: number;
      /** <schema> Innate ranks */
      innateRanks: string;
      /** <schema> Maximum lifespan */
      lifespan: number | null;
      /** <schema> Size constraints */
      size: Foundry.BarField & {
        /** <schema> Enabled */
        enabled: boolean;
      };
      /** <schema> Traits */
      traits: Set<Teriock.Keys.Trait>;

      get parent(): TeriockSpecies;
    };
  }
}

export {};
