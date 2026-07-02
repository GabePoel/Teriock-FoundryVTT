declare global {
  namespace Teriock.Models {
    export type SpeciesSystemData = SpeciesTransformationPartData & {
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
      /** <schema> MP increase */
      mpIncrease: string;
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
